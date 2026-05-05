import type { Request, Response } from "express";
import { payroll as Payroll } from "../../../models/payroll";
import { user as User } from "../../../models/user";
import { penalty as Penalty } from "../../../models/penalty";
import { reimburse as Reimburse } from "../../../models/reimburse";
import { leave_management as LeaveManagement } from "../../../models/leave_management";

export const generatePayroll = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const targetUser = await User.findOne({ where: { name } });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = targetUser.user_id;
    const baseSalary = targetUser.salary ?? 0;

    // Calculate total penalty
    const penalties = await Penalty.findAll({ where: { user_id } });
    const totalPenalty = penalties.reduce((acc, item) => acc + (item.amount ?? 0), 0);

    // Calculate total reimburse (only approved)
    const reimburses = await Reimburse.findAll({ where: { user_id, approve: true } });
    const totalReimburse = reimburses.reduce((acc, item) => acc + (item.amount ?? 0), 0);

    // Calculate total leave days (approved leaves)
    const leaveCount = await LeaveManagement.count({ where: { user_id, cuti: true } });
    const leaveDays = leaveCount;
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
