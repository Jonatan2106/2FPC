import type { Request, Response } from "express";
import { payroll as Payroll } from "../../../models/payroll";
import { user as User } from "../../../models/user";
import { penalty as Penalty } from "../../../models/penalty";
import { reimburse as Reimburse } from "../../../models/reimburse";
import { leave_management as LeaveManagement } from "../../../models/leave_management";

const MONTHLY_CUTOFF_DAYS = 7;

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

const getPayrollPeriod = (reference: Date, cutoffDays: number) => {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // If now is within H-7 before month end, move calculation window to next month.
  const cutoffStartDay = Math.max(1, daysInMonth - (cutoffDays - 1));
  const cutoffStart = new Date(year, month, cutoffStartDay, 0, 0, 0, 0);
  const useNextMonth = reference >= cutoffStart;

  const targetMonthDate = useNextMonth
    ? new Date(year, month + 1, 1)
    : new Date(year, month, 1);

  const start = new Date(
    targetMonthDate.getFullYear(),
    targetMonthDate.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
  const end = new Date(
    targetMonthDate.getFullYear(),
    targetMonthDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return {
    start,
    end,
    label: start.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
  };
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

export const generatePayroll = async (req: Request, res: Response) => {
  try {
    const { name, pay_date } = req.body as { name?: string; pay_date?: string };

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const referenceDate = pay_date ? toValidDate(pay_date) : new Date();
    if (!referenceDate) {
      return res.status(400).json({ message: "pay_date is invalid" });
    }

    const period = getPayrollPeriod(referenceDate, MONTHLY_CUTOFF_DAYS);

    const targetUser = await User.findOne({ where: { name } });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = targetUser.user_id;
    const baseSalary = targetUser.salary ?? 0;

    // Calculate monthly penalty total
    const penalties = await Penalty.findAll({ where: { user_id } });
    const totalPenalty = penalties
      .filter((item) =>
        isWithinRange(
          getValueFromModel(item, ["penaltyAt", "createdAt"]),
          period.start,
          period.end
        )
      )
      .reduce((acc, item) => acc + (item.amount ?? 0), 0);

    // Calculate monthly reimburse total (only approved)
    const reimburses = await Reimburse.findAll({ where: { user_id, approve: true } });
    const totalReimburse = reimburses
      .filter((item) =>
        isWithinRange(
          getValueFromModel(item, ["approvedAt", "updatedAt", "createdAt"]),
          period.start,
          period.end
        )
      )
      .reduce((acc, item) => acc + extractReimburseAmount(item), 0);

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
    const finalSalary = baseSalary + totalReimburse - totalPenalty - leaveDeduction;

    // Create payroll record
    const payrollData = await Payroll.create({
      user_id,
      total_income: finalSalary,
      paidAt: new Date(),
    });

    return res.status(201).json({
      message: "Payroll generated",
      data: {
        payroll_id: payrollData.payroll_id,
        user_id,
        staff_name: name,
        base_salary: baseSalary,
        total_penalty: totalPenalty,
        total_reimburse: totalReimburse,
        leave_days: leaveDays,
        leave_deduction: leaveDeduction,
        final_salary: finalSalary,
        payroll_period_start: period.start,
        payroll_period_end: period.end,
        payroll_period_label: period.label,
        payroll_cutoff_days: MONTHLY_CUTOFF_DAYS,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate payroll", error });
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
