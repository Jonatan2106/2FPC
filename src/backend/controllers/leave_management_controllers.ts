import type { Request, Response } from "express";
import { leave_management as LeaveManagement } from "../../../models/leave_management";

export const createLeaveRequestStaff = async (req: Request, res: Response) => {
  try {
    const { user_id, reason } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const leaveRequest = await LeaveManagement.create({
      user_id,
      cuti: false,
      reason: reason ?? null,
      approvedAt: null,
    });

    return res.status(201).json({ message: "Leave request submitted", data: leaveRequest });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit leave request", error });
  }
};

export const approveOrDeclineLeaveManager = async (req: Request, res: Response) => {
  try {
    const leaveId = String(req.params.id);
    const leaveRequest = await LeaveManagement.findByPk(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const { approve } = req.body as { approve?: boolean };
    await leaveRequest.update({
      cuti: approve === true,
      approvedAt: new Date(),
    });

    return res.status(200).json({ message: "Leave request processed", data: leaveRequest });
  } catch (error) {
    return res.status(500).json({ message: "Failed to process leave request", error });
  }
};

export const getLeaveTimelineAdmin = async (_req: Request, res: Response) => {
  try {
    const leaveData = await LeaveManagement.findAll({
      order: [["createdAt", "DESC"]],
    });

    const timeline = leaveData.map((item) => ({
      leave_id: item.leave_id,
      user_id: item.user_id,
      reason: item.reason,
      requested_at: item.createdAt,
      approved_at: item.approvedAt,
      approved: item.cuti,
    }));

    return res.status(200).json({ message: "Leave timeline fetched", data: timeline });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch leave timeline", error });
  }
};
