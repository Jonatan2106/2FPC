import type { Request, Response } from "express";
import { payroll as Payroll } from "../../../models/payroll";
import { user as User } from "../../../models/user";
import { penalty as Penalty } from "../../../models/penalty";

export const generatePayroll = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const targetUser = await User.findByPk(user_id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const penalties = await Penalty.findAll({ where: { user_id } });
    const totalPenalty = penalties.reduce((acc, item) => acc + (item.amount ?? 0), 0);
    const baseSalary = targetUser.salary ?? 0;
    const totalIncome = Math.max(baseSalary - totalPenalty, 0);

    const payrollData = await Payroll.create({
      user_id,
      total_income: totalIncome,
      paidAt: new Date(),
    });

    return res.status(201).json({
      message: "Payroll generated",
      data: {
        payroll_id: payrollData.payroll_id,
        user_id,
        base_salary: baseSalary,
        total_penalty: totalPenalty,
        total_income: totalIncome,
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
