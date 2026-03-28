import type { Request, Response } from "express";
import { penalty as Penalty } from "../../../models/penalty";

export const createPenalty = async (req: Request, res: Response) => {
  try {
    const { user_id, category, note, amount } = req.body;

    if (!user_id || !category) {
      return res.status(400).json({ message: "user_id and category are required" });
    }

    const newPenalty = await Penalty.create({
      user_id,
      category,
      note: note ?? null,
      amount: amount ?? 0,
      penaltyAt: new Date(),
    });

    return res.status(201).json({ message: "Penalty created", data: newPenalty });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create penalty", error });
  }
};
