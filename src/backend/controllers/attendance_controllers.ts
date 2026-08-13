import type { Request, Response } from "express";
import QRCode from "qrcode";
import { attendance as Attendance } from "../../../models/attendance";
import { user as User } from "../../../models/user";
import { staff_detail as StaffDetail } from "../../../models/staff_details";
import { departement as Departement } from "../../../models/departements";
import { Op } from "sequelize";
import { generateAttendanceQrToken, verifyToken } from "../utils/jwt_helper";
import { calculateLatePenalty } from "../utils/payroll_helpers";

const getRequesterAttendanceScope = async (req: Request): Promise<string[] | null> => {
  const requesterId = req.headers["x-user-id"] as string | undefined;
  const requesterRole = req.headers["x-user-role"] as string | undefined;

  if (!requesterId) {
    return [];
  }

  if (requesterRole === "Admin") {
    return null;
  }

  if (requesterRole === "Manager") {
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
  }

  return [requesterId];
};
export const clockInAttendanceStaff = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const clockInAt = new Date();
    const newAttendance = await Attendance.create({
      user_id,
      clock_in: clockInAt,
      clock_out: null,
    });

    const latePenalty = calculateLatePenalty(clockInAt);

    return res.status(201).json({
      message: "Clock in success",
      data: {
        attendance: newAttendance,
        late_penalty: latePenalty.isLate
          ? {
              amount: latePenalty.amount,
              minutes_late: latePenalty.minutesLate,
              hours_late: latePenalty.lateHours,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clock in", error });
  }
};

export const clockOutAttendanceStaff = async (req: Request, res: Response) => {
  try {
    const attendanceId = String(req.params.id);
    const attendanceRecord = await Attendance.findByPk(attendanceId);
    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await attendanceRecord.update({ clock_out: new Date() });
    return res.status(200).json({ message: "Clock out success", data: attendanceRecord });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clock out", error });
  }
};

export const getAttendanceData = async (req: Request, res: Response) => {
  try {
    const allowedUserIds = await getRequesterAttendanceScope(req);
    const userId = req.query.user_id as string | undefined;

    const whereClause: Record<string, unknown> = {};

    if (allowedUserIds !== null) {
      whereClause.user_id = {
        [Op.in]: allowedUserIds.length > 0 ? allowedUserIds : ["__no_match__"],
      };
    }

    if (userId) {
      if (allowedUserIds !== null && !allowedUserIds.includes(userId)) {
        whereClause.user_id = { [Op.in]: ["__no_match__"] };
      } else {
        whereClause.user_id = userId;
      }
    }

    const attendanceData = await Attendance.findAll({
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

    const shaped = attendanceData.map((item) => ({
      attendance_id: item.attendance_id,
      user_id: item.user_id,
      clock_in: item.clock_in,
      clock_out: item.clock_out,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      user: {
        id: item.user_data?.user_id ?? item.user_id,
        name: item.user_data?.name ?? null,
        departement: item.user_data?.staff_detail?.departement_data?.company_name ?? null,
      },
    }));

    return res.status(200).json({ message: "Attendance fetched", data: shaped });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch attendance", error });
  }
};

export const updateAttendanceAdmin = async (req: Request, res: Response) => {
  try {
    const attendanceId = String(req.params.id);
    const attendanceRecord = await Attendance.findByPk(attendanceId);
    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await attendanceRecord.update(req.body);
    return res.status(200).json({ message: "Attendance updated", data: attendanceRecord });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update attendance", error });
  }
};

export const generateAttendanceQr = async (req: Request, res: Response) => {
  try {
    const userIdFromHeader = (req.headers["x-user-id"] as string);
    const userIdFromBody = (req.body as { user_id?: string } | undefined)?.user_id;
    console.log('[generateAttendanceQr] x-user-id from header:', userIdFromHeader);
    console.log('[generateAttendanceQr] user_id from body:', userIdFromBody);
    
    const userId = userIdFromHeader || userIdFromBody;
    console.log('[generateAttendanceQr] Using userId:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const qrToken = generateAttendanceQrToken(userId);
    console.log('[generateAttendanceQr] Generated QR token with userId:', userId);
    
    const qrDataUrl = await QRCode.toDataURL(qrToken);

    return res.status(200).json({
      message: "Attendance QR generated",
      data: {
        user_id: userId,
        qr_token: qrToken,
        qr_data_url: qrDataUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate attendance QR", error });
  }
};

export const clockInByQrScan = async (req: Request, res: Response) => {
  try {
    const { qr_token } = req.body as { qr_token?: string };
    console.log('[clockInByQrScan] Received qr_token:', qr_token ? 'present' : 'missing');
    
    if (!qr_token) {
      return res.status(400).json({ message: "qr_token is required" });
    }

    const payload = verifyToken(qr_token);
    console.log('[clockInByQrScan] Token payload:', payload);
    
    if (!payload || payload.purpose !== "attendance_qr") {
      return res.status(400).json({ message: "Invalid or expired QR token" });
    }

    const userId = payload.userId;
    console.log('[clockInByQrScan] User ID from token:', userId, 'Type:', typeof userId);

    // Validate user exists in database
    const user = await User.findByPk(userId);
    console.log('[clockInByQrScan] User found in database:', !!user);
    
    if (!user) {
      return res.status(400).json({ message: `User not found in database. User ID: ${userId}` });
    }

    const openAttendance = await Attendance.findOne({
      where: {
        user_id: userId,
        clock_out: null,
      },
      order: [["createdAt", "DESC"]],
    });

    console.log('[clockInByQrScan] Open attendance found:', !!openAttendance);
    if (openAttendance) {
      return res.status(409).json({ message: "User already clocked in and not clocked out yet" });
    }

    const clockInAt = new Date();
    const attendanceData = await Attendance.create({
      user_id: userId,
      clock_in: clockInAt,
      clock_out: null,
    });

    const latePenalty = calculateLatePenalty(clockInAt);

    console.log('[clockInByQrScan] Success for user:', userId);
    return res.status(201).json({
      message: "Clock in by QR success",
      data: {
        attendance: attendanceData,
        late_penalty: latePenalty.isLate
          ? {
              amount: latePenalty.amount,
              minutes_late: latePenalty.minutesLate,
              hours_late: latePenalty.lateHours,
            }
          : null,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[clockInByQrScan] Error:', errorMsg);
    return res.status(500).json({ message: "Failed to clock in by QR: " + errorMsg });
  }
};
