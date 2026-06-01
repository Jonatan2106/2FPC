import type { Request, Response } from "express";
import { reimburse as Reimburse } from "../../../models/reimburse";
import { user as User } from "../../../models/user";
import { staff_detail as StaffDetail } from "../../../models/staff_details";
import { departement as Departement } from "../../../models/departements";
import { Op } from "sequelize";

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

export const createReimburseRequestStaff = async (req: Request, res: Response) => {
  try {
    const { user_id, evidence, amount } = req.body as {
      user_id?: string;
      evidence?: string;
      amount?: number | string;
    };

    if (!user_id || !evidence) {
      return res.status(400).json({ message: "user_id and evidence are required" });
    }

    const parsedAmount = typeof amount === "string" ? Number(amount) : amount;
    const normalizedAmount = Number.isFinite(parsedAmount as number) && (parsedAmount as number) > 0
      ? Number(parsedAmount)
      : 0;

    const reimburseData = await Reimburse.create({
      user_id,
      evidence,
      amount: normalizedAmount,
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
    const allowedUserIds = await getRequesterUserIds(req);
    const reimburseId = String(req.params.id);
    const reimburseData = await Reimburse.findByPk(reimburseId);
    if (!reimburseData) {
      return res.status(404).json({ message: "Reimburse request not found" });
    }

    if (allowedUserIds !== null && !allowedUserIds.includes(reimburseData.user_id)) {
      return res.status(403).json({ message: "You can only process reimburse requests from your department" });
    }

    const body = (req.body ?? {}) as { approve?: boolean; decision?: string };
    const approve =
      typeof body.approve === "boolean"
        ? body.approve
        : body.decision === "approved";

    await reimburseData.update({
      approve,
      approvedAt: approve ? new Date() : null,
      updatedAt: new Date(),
    });

    await reimburseData.reload();

    return res.status(200).json({ message: "Reimburse request processed", data: reimburseData });
  } catch (error) {
    return res.status(500).json({ message: "Failed to process reimburse request", error });
  }
};

export const getAllReimburseRequests = async (req: Request, res: Response) => {
  try {
    const allowedUserIds = await getRequesterUserIds(req);
    const { user_id, approve } = req.query;

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

    if (approve !== undefined) {
      whereClause.approve = approve === "true";
    }

    const reimburseData = await Reimburse.findAll({
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
                {
                  model: Departement,
                  as: "departement_data",
                        attributes: ["company_name"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const shaped = reimburseData.map((r) => ({
      reimburse_id: r.reimburse_id,
      approve: r.approve,
      amount: r.amount,
      evidence: r.evidence,
      approvedAt: r.approvedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.user_data?.user_id ?? r.user_id,
        name: r.user_data?.name ?? null,
        departement: r.user_data?.staff_detail?.departement_data?.company_name ?? null,
      },
    }));

    return res.status(200).json({ message: "Reimburse requests retrieved successfully", data: shaped });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve reimburse requests", error });
  }
};

export const getPendingReimburseRequests = async (_req: Request, res: Response) => {
  try {
    const allowedUserIds = await getRequesterUserIds(_req);
    const pendingCount = await Reimburse.count({
      where: {
        approve: false,
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
      message: "Pending reimburse requests count fetched",
      data: { pendingReimburseCount: pendingCount },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending reimburse requests", error });
  }
};

export const getReimburseRequestById = async (req: Request, res: Response) => {
  try {
    const allowedUserIds = await getRequesterUserIds(req);
    const reimburseId = String(req.params.id);
    const reimburseData = await Reimburse.findByPk(reimburseId, {
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
                {
                  model: Departement,
                  as: "departement_data",
                          attributes: ["company_name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!reimburseData) {
      return res.status(404).json({ message: "Reimburse request not found" });
    }

    if (allowedUserIds !== null && !allowedUserIds.includes(reimburseData.user_id)) {
      return res.status(403).json({ message: "You can only access reimburse requests from your department" });
    }

    const shaped = {
      reimburse_id: reimburseData.reimburse_id,
      approve: reimburseData.approve,
      amount: reimburseData.amount,
      evidence: reimburseData.evidence,
      approvedAt: reimburseData.approvedAt,
      createdAt: reimburseData.createdAt,
      updatedAt: reimburseData.updatedAt,
      user: {
        id: reimburseData.user_data?.user_id ?? reimburseData.user_id,
        name: reimburseData.user_data?.name ?? null,
        departement: reimburseData.user_data?.staff_detail?.departement_data?.company_name ?? null,
      },
    };

    return res.status(200).json({ message: "Reimburse request retrieved successfully", data: shaped });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve reimburse request", error });
  }
};
