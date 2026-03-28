import type { Request, Response } from "express";
import { reimburse as Reimburse } from "../../../models/reimburse";

export const createReimburseRequestStaff = async (req: Request, res: Response) => {
  try {
    const { user_id, evidence } = req.body;

    if (!user_id || !evidence) {
      return res.status(400).json({ message: "user_id and evidence are required" });
    }

    const reimburseData = await Reimburse.create({
      user_id,
      evidence,
      approve: false,
      approvedAt: null,
    });

    return res.status(201).json({ message: "Reimburse request submitted", data: reimburseData });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit reimburse request", error });
  }
};

export const approveOrDeclineReimburseManager = async (req: Request, res: Response) => {
  try {
    const reimburseId = String(req.params.id);
    const reimburseData = await Reimburse.findByPk(reimburseId);
    if (!reimburseData) {
      return res.status(404).json({ message: "Reimburse request not found" });
    }

    const { approve } = req.body as { approve?: boolean };

    await reimburseData.update({
      approve: approve === true,
      approvedAt: new Date(),
    });

    return res.status(200).json({ message: "Reimburse request processed", data: reimburseData });
  } catch (error) {
    return res.status(500).json({ message: "Failed to process reimburse request", error });
  }
};
