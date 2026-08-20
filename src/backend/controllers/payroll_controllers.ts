import type { Request, Response } from "express";
import { payroll as Payroll } from "../../../models/payroll";
import { user as User } from "../../../models/user";
import { penalty as Penalty } from "../../../models/penalty";
import { reimburse as Reimburse } from "../../../models/reimburse";
import { leave_management as LeaveManagement } from "../../../models/leave_management";
import { getPayrollPeriod } from "../utils/payroll_helpers";

const toValidDate = (value: unknown): Date | null => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinRange = (date: Date | null, start: Date, end: Date): boolean => {
  if (!date) return false;
  return date >= start && date <= end;
};

const getValueFromModel = (item: { get: (key: string) => unknown }, keys: string[]): Date | null => {
  for (const key of keys) {
    const value = item.get(key);
    const parsed = toValidDate(value);
    if (parsed) return parsed;
  }
  return null;
};

const extractReimburseAmount = (item: { amount?: number | string | null; evidence?: string | null }) => {
  // Handle DECIMAL values returned as strings by Sequelize
  if (item.amount !== undefined && item.amount !== null) {
    const num = typeof item.amount === "number" ? item.amount : Number(String(item.amount).replace(/,/g, ""));
    if (Number.isFinite(num) && num > 0) return num;
  }

  const evidenceText = item.evidence ?? "";
  const match = evidenceText.match(/nominal\s*:\s*([0-9][0-9.,]*)/i);
  if (!match) {
    return 0;
  }

  const numeric = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
};

const buildPayrollBreakdown = (params: {
  baseSalary: number;
  penalties: Array<{ penalty_id: string; amount: number | null; category: string | null; note: string | null; penaltyAt: Date | null; createdAt?: Date | null }>;
  reimburses: Array<{ reimburse_id: string; amount?: number | string | null; evidence?: string | null; approvedAt?: Date | null; createdAt?: Date | null }>;
  leaveDays: number;
  leaveDeduction: number;
  periodLabel: string;
}) => {
  const penaltyItems = params.penalties.map((item) => ({
    type: "deduction" as const,
    source: "penalty",
    label: "Denda lainnya",
    note: item.note || "Penalty record",
    amount: Number(item.amount ?? 0),
    paid_at: item.penaltyAt ?? item.createdAt ?? null,
  }));

  const reimburseItems = params.reimburses.map((item) => ({
    type: "income" as const,
    source: "reimburse",
    label: "Reimburse approved",
    note: item.evidence || "Approved reimburse",
    amount: extractReimburseAmount(item),
    paid_at: item.approvedAt ?? item.createdAt ?? null,
  }));

  const leaveItems = params.leaveDays > 0
    ? [{
        type: "deduction" as const,
        source: "leave",
        label: `Potongan cuti (${params.leaveDays} hari)`,
        note: `Periode payroll ${params.periodLabel}`,
        amount: params.leaveDeduction,
        paid_at: null as Date | null,
      }]
    : [];

  const breakdown = [
    {
      type: "income" as const,
      source: "base_salary",
      label: "Gaji pokok",
      note: "Nilai dasar dari payroll staff",
      amount: params.baseSalary,
      paid_at: null as Date | null,
    },
    ...reimburseItems,
    ...penaltyItems,
    ...leaveItems,
  ];

  const totalPenalty = params.penalties.reduce((acc, item) => acc + Number(item.amount ?? 0), 0);
  const totalReimburse = params.reimburses.reduce((acc, item) => acc + extractReimburseAmount(item), 0);
  const finalSalary = params.baseSalary + totalReimburse - totalPenalty - params.leaveDeduction;

  return {
    totalPenalty,
    totalReimburse,
    finalSalary,
    breakdown,
  };
};

const mapPayrollRecord = (payrollRecord: any) => {
  const record = payrollRecord.get({ plain: true }) as Record<string, unknown>;
  return {
    payroll_id: record.payroll_id,
    user_id: record.user_id,
    total_income: record.total_income,
    base_salary: record.base_salary,
    total_penalty: record.total_penalty,
    total_reimburse: record.total_reimburse,
    leave_deduction: record.leave_deduction,
    payroll_period_key: record.payroll_period_key,
    payroll_period_label: record.payroll_period_label,
    payroll_period_start: record.payroll_period_start,
    payroll_period_end: record.payroll_period_end,
    payroll_cutoff_days: record.payroll_cutoff_days,
    breakdown: record.breakdown,
    paidAt: record.paidAt,
    createdAt: record.createdAt,
    generated_by: record.username || null,
    paid_by: record.username || null,
  };
};

export const generatePayroll = async (req: Request, res: Response) => {
  try {
    const { name, pay_date } = req.body as { name?: string; pay_date?: string };
    const adminId = (req as any).user?.userId || (req as any).user?.id;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const referenceDate = pay_date ? toValidDate(pay_date) : new Date();
    if (!referenceDate) {
      return res.status(400).json({ message: "pay_date is invalid" });
    }

    const payrollCutoffDay = referenceDate.getDate();
    const period = getPayrollPeriod(referenceDate, payrollCutoffDay);

    const targetUser = await User.findOne({ where: { name } });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = targetUser.user_id;
    const baseSalary = targetUser.salary ?? 0;

    // Calculate monthly penalty total
    const penalties = await Penalty.findAll({ where: { user_id } });
    const filteredPenalties = penalties
      .filter((item) =>
        isWithinRange(
          getValueFromModel(item, ["penaltyAt", "createdAt"]),
          period.start,
          period.end
        )
      );

    // Calculate monthly reimburse total (only approved)
    const reimburses = await Reimburse.findAll({ where: { user_id, approve: true } });
    const filteredReimburses = reimburses
      .filter((item) =>
        isWithinRange(
          getValueFromModel(item, ["approvedAt", "updatedAt", "createdAt"]),
          period.start,
          period.end
        )
      );

    // Calculate monthly leave days (approved leaves)
    const leaves = await LeaveManagement.findAll({ where: { user_id, cuti: true } });
    const leaveDays = leaves.filter((item) =>
      isWithinRange(
        getValueFromModel(item, ["approvedAt", "updatedAt", "createdAt"]),
        period.start,
        period.end
      )
    ).length;

    const leaveDeduction = leaveDays * 50000;

    // Calculate final salary
    const payrollComputation = buildPayrollBreakdown({
      baseSalary,
      penalties: filteredPenalties,
      reimburses: filteredReimburses,
      leaveDays,
      leaveDeduction,
      periodLabel: period.label,
    });

    const existingPayroll = await Payroll.findOne({
      where: {
        user_id,
        payroll_period_key: period.key,
      },
    });

    const payload = {
      user_id,
      total_income: payrollComputation.finalSalary,
      base_salary: baseSalary,
      total_penalty: payrollComputation.totalPenalty,
      total_reimburse: payrollComputation.totalReimburse,
      leave_deduction: leaveDeduction,
      payroll_period_key: period.key,
      payroll_period_label: period.label,
      payroll_period_start: period.start,
      payroll_period_end: period.end,
      payroll_cutoff_days: payrollCutoffDay,
      breakdown: payrollComputation.breakdown,
      paidAt: null,
      generated_by: adminId,
    };

    const payrollData = existingPayroll
      ? await existingPayroll.update(payload)
      : await Payroll.create(payload);

    return res.status(201).json({
      message: "Payroll generated as unpaid",
      data: {
        ...mapPayrollRecord(payrollData),
        user_id,
        staff_name: name,
        base_salary: baseSalary,
        total_penalty: payrollComputation.totalPenalty,
        total_reimburse: payrollComputation.totalReimburse,
        leave_days: leaveDays,
        leave_deduction: leaveDeduction,
        final_salary: payrollComputation.finalSalary,
        payroll_period_start: period.start,
        payroll_period_end: period.end,
        payroll_period_label: period.label,
        payroll_period_key: period.key,
        payroll_cutoff_days: payrollCutoffDay,
        paidAt: payrollData.paidAt ?? null,
        payment_status: payrollData.paidAt ? "paid" : "unpaid",
        breakdown: payrollComputation.breakdown,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate payroll", error });
  }
};

export const getPayrollSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string | undefined) || (req.headers["x-user-id"] as string | undefined);
    const referenceDate = req.query.reference_date ? toValidDate(req.query.reference_date) : new Date();

    if (!userId) {
      return res.status(400).json({ message: "user_id is required" });
    }

    if (!referenceDate) {
      return res.status(400).json({ message: "reference_date is invalid" });
    }

    const payrollCutoffDay = referenceDate.getDate();
    const period = getPayrollPeriod(referenceDate, payrollCutoffDay);
    const payrollRecord = await Payroll.findOne({
      where: {
        user_id: userId,
        payroll_period_key: period.key,
      },
    });

    const targetUser = await User.findByPk(userId);
    const baseSalary = targetUser?.salary ?? 0;

    if (!payrollRecord) {
      return res.status(200).json({
        message: "Payroll not found for selected period",
        data: {
          hasPayroll: false,
          user_id: userId,
          staff_name: targetUser?.name ?? null,
          base_salary: baseSalary,
          total_income: baseSalary,
          payment_status: "unpaid",
          paidAt: null,
          payroll_period_key: period.key,
          payroll_period_label: period.label,
          payroll_period_start: period.start,
          payroll_period_end: period.end,
          payroll_cutoff_days: payrollCutoffDay,
          breakdown: [],
        },
      });
    }

    return res.status(200).json({
      message: "Payroll fetched",
      data: {
        hasPayroll: true,
        ...mapPayrollRecord(payrollRecord),
        base_salary: payrollRecord.base_salary ?? baseSalary,
        payment_status: payrollRecord.paidAt ? "paid" : "unpaid",
        paidAt: payrollRecord.paidAt ?? null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch payroll summary", error });
  }
};

export const markPayrollPaid = async (req: Request, res: Response) => {
  try {
    const { user_id, pay_date } = req.body as { user_id?: string; pay_date?: string };
    const adminId = (req as any).user?.user_id || (req as any).user?.id;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const referenceDate = pay_date ? toValidDate(pay_date) : new Date();
    if (!referenceDate) {
      return res.status(400).json({ message: "pay_date is invalid" });
    }

    const period = getPayrollPeriod(referenceDate, referenceDate.getDate());
    const payrollRecord = await Payroll.findOne({
      where: {
        user_id,
        payroll_period_key: period.key,
      },
    });

    if (!payrollRecord) {
      return res.status(404).json({ message: "Payroll record not found for this period" });
    }

    const updatedPayroll = await payrollRecord.update({ paidAt: new Date(), paid_by: adminId });
    return res.status(200).json({
      message: "Payroll marked as paid",
      data: {
        ...mapPayrollRecord(updatedPayroll),
        payment_status: "paid",
        paidAt: updatedPayroll.paidAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark payroll as paid", error });
  }
};

export const createStaffSalaryAdmin = async (req: Request, res: Response) => {
  try {
    const { user_id, salary } = req.body;

    if (!user_id || salary === undefined) {
      return res.status(400).json({ message: "user_id and salary are required" });
    }

    const targetUser = await User.findByPk(user_id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await targetUser.update({ salary });
    return res.status(200).json({ message: "Salary set", data: targetUser });
  } catch (error) {
    return res.status(500).json({ message: "Failed to set salary", error });
  }
};
