import type { Request, Response } from "express";
import { leave_management as LeaveManagement } from "../../../models/leave_management";
import { reimburse as Reimburse } from "../../../models/reimburse";
import { user as User } from "../../../models/user";

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

export const getAllLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { user_id, approved } = req.query;

    const whereClause: Record<string, any> = {};

    if (user_id) {
      whereClause.user_id = String(user_id);
    }

    if (approved !== undefined) {
      whereClause.cuti = approved === "true";
    }

    const leaveData = await LeaveManagement.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Leave requests retrieved successfully",
      data: leaveData,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve leave requests", error });
  }
};

export const getPendingLeaveRequests = async (_req: Request, res: Response) => {
  try {
    const pendingCount = await LeaveManagement.count({
      where: {
        cuti: false,
        approvedAt: null,
      },
    });

    return res.status(200).json({
      message: "Pending leave requests count fetched",
      data: { pendingLeaveCount: pendingCount },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending leave requests", error });
  }
};

export const getPendingRequestsActivity = async (_req: Request, res: Response) => {
  try {
    const [pendingLeaveRequests, pendingReimburseRequests] = await Promise.all([
      LeaveManagement.findAll({
        where: {
          cuti: false,
          approvedAt: null,
        },
        include: [{ model: User, as: "user_data", attributes: ["name"] }],
        order: [["createdAt", "DESC"]],
      }),
      Reimburse.findAll({
        where: {
          approve: false,
          approvedAt: null,
        },
        include: [{ model: User, as: "user_data", attributes: ["name"] }],
        order: [["createdAt", "DESC"]],
      }),
    ]);

    const leaveActivities = pendingLeaveRequests.map((item) => ({
      id: item.leave_id,
      userName: item.user_data?.name ?? "Unknown",
      description: "Pending leave management request",
      type: "leave",
      requestedAt: item.createdAt,
    }));

    const reimburseActivities = pendingReimburseRequests.map((item) => ({
      id: item.reimburse_id,
      userName: item.user_data?.name ?? "Unknown",
      description: "Pending reimburse request",
      type: "reimburse",
      requestedAt: item.createdAt,
    }));

    const activities = [...leaveActivities, ...reimburseActivities].sort(
      (a, b) => b.requestedAt.getTime() - a.requestedAt.getTime(),
    );

    return res.status(200).json({
      message: "Pending requests activity fetched",
      data: activities,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending requests activity", error });
  }
};

export const getLeaveRequestById = async (req: Request, res: Response) => {
  try {
    const leaveId = String(req.params.id);
    const leaveRequest = await LeaveManagement.findByPk(leaveId);

    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    return res.status(200).json({
      message: "Leave request retrieved successfully",
      data: leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve leave request", error });
  }
};
