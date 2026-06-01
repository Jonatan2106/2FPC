import type { Request, Response } from "express";
import { leave_management as LeaveManagement } from "../../../models/leave_management";
import { reimburse as Reimburse } from "../../../models/reimburse";
import { user as User } from "../../../models/user";
import { staff_detail as StaffDetail } from "../../../models/staff_details";
import { Op } from "sequelize";
import { departement as Departement } from "../../../models/departements";

const getRequesterUserIds = async (req: Request): Promise<string[] | null> => {
  const requesterId = req.headers["x-user-id"] as string | undefined;
  const requesterRole = req.headers["x-user-role"] as string | undefined;

  if (!requesterId) {
    return [];
  }

  if (requesterRole === "Admin") {
    return null;
  }

  const requester = await User.findByPk(requesterId, {
    include: [
      {
        model: StaffDetail,
        attributes: ["departement_id"],
      },
    ],
  });

  const departementId = requester?.staff_detail?.departement_id;
  if (!departementId) {
    return [];
  }

  const departmentUsers = await User.findAll({
    attributes: ["user_id"],
    include: [
      {
        model: StaffDetail,
        attributes: [],
        where: { departement_id: departementId },
      },
    ],
  });

  return departmentUsers.map((user) => user.user_id);
};

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
    const allowedUserIds = await getRequesterUserIds(req);
    const leaveId = String(req.params.id);
    const leaveRequest = await LeaveManagement.findByPk(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (allowedUserIds !== null && !allowedUserIds.includes(leaveRequest.user_id)) {
      return res.status(403).json({ message: "You can only process leave requests from your department" });
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
    const allowedUserIds = await getRequesterUserIds(req);
    const { user_id, approved } = req.query;

    const whereClause: Record<string, any> = {};

    if (allowedUserIds !== null) {
      whereClause.user_id = { [Op.in]: allowedUserIds.length > 0 ? allowedUserIds : ["__no_match__"] };
    }

    if (user_id) {
      const requestedUserId = String(user_id);
      if (allowedUserIds !== null && !allowedUserIds.includes(requestedUserId)) {
        whereClause.user_id = { [Op.in]: ["__no_match__"] };
      } else {
        whereClause.user_id = requestedUserId;
      }
    }

    if (approved !== undefined) {
      whereClause.cuti = approved === "true";
    }

    const leaveData = await LeaveManagement.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: [
        {
          model: User,
          as: "user_data",
          attributes: ["user_id", "name"],
          include: [
            {
              model: StaffDetail,
              as: "staff_detail",
              attributes: ["departement_id"],
              include: [
                { model: Departement, as: "departement_data", attributes: ["company_name"] },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const shaped = leaveData.map((l) => ({
      leave_id: l.leave_id,
      cuti: l.cuti,
      reason: l.reason,
      approvedAt: l.approvedAt,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      user: {
        id: l.user_data?.user_id ?? l.user_id,
        name: l.user_data?.name ?? null,
        departement: l.user_data?.staff_detail?.departement_data?.company_name ?? null,
      },
    }));

    return res.status(200).json({ message: "Leave requests retrieved successfully", data: shaped });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve leave requests", error });
  }
};

export const getPendingLeaveRequests = async (_req: Request, res: Response) => {
  try {
    const allowedUserIds = await getRequesterUserIds(_req);
    const pendingCount = await LeaveManagement.count({
      where: {
        cuti: false,
        approvedAt: null,
        ...(allowedUserIds !== null
          ? {
              user_id: {
                [Op.in]: allowedUserIds.length > 0 ? allowedUserIds : ["__no_match__"],
              },
            }
          : {}),
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
    const allowedUserIds = await getRequesterUserIds(_req);
    const userFilter =
      allowedUserIds !== null
        ? { [Op.in]: allowedUserIds.length > 0 ? allowedUserIds : ["__no_match__"] }
        : undefined;

    const [pendingLeaveRequests, pendingReimburseRequests] = await Promise.all([
      LeaveManagement.findAll({
        where: {
          cuti: false,
          approvedAt: null,
          ...(userFilter ? { user_id: userFilter } : {}),
        },
        include: [
          {
            model: User,
            as: "user_data",
            attributes: ["user_id", "name"],
            include: [
              {
                model: StaffDetail,
                as: "staff_detail",
                attributes: ["departement_id"],
                include: [
                  { model: Departement, as: "departement_data", attributes: ["company_name"] },
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      }),
      Reimburse.findAll({
        where: {
          approve: false,
          approvedAt: null,
          ...(userFilter ? { user_id: userFilter } : {}),
        },
        include: [
          {
            model: User,
            as: "user_data",
            attributes: ["user_id", "name"],
            include: [
              {
                model: StaffDetail,
                as: "staff_detail",
                attributes: ["departement_id"],
                include: [
                  { model: Departement, as: "departement_data", attributes: ["company_name"] },
                ],
              },
            ],
          },
        ],
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
    const allowedUserIds = await getRequesterUserIds(req);
    const leaveId = String(req.params.id);
    const leaveRequest = await LeaveManagement.findByPk(leaveId, {
      include: [
        {
          model: User,
          as: "user_data",
          attributes: ["user_id", "name"],
          include: [
            {
              model: StaffDetail,
              as: "staff_detail",
              attributes: ["departement_id"],
              include: [
                { model: Departement, as: "departement_data", attributes: ["company_name"] },
              ],
            },
          ],
        },
      ],
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (allowedUserIds !== null && !allowedUserIds.includes(leaveRequest.user_id)) {
      return res.status(403).json({ message: "You can only access leave requests from your department" });
    }

    const shaped = {
      leave_id: leaveRequest.leave_id,
      cuti: leaveRequest.cuti,
      reason: leaveRequest.reason,
      approvedAt: leaveRequest.approvedAt,
      createdAt: leaveRequest.createdAt,
      updatedAt: leaveRequest.updatedAt,
      user: {
        id: leaveRequest.user_data?.user_id ?? leaveRequest.user_id,
        name: leaveRequest.user_data?.name ?? null,
        departement: leaveRequest.user_data?.staff_detail?.departement_data?.company_name ?? null,
      },
    };

    return res.status(200).json({ message: "Leave request retrieved successfully", data: shaped });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve leave request", error });
  }
};
