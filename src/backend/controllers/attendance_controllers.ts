import type { Request, Response } from "express";
import QRCode from "qrcode";
import { attendance as Attendance } from "../../../models/attendance";
import { user as User } from "../../../models/user";
import { generateAttendanceQrToken, verifyToken } from "../utils/jwt_helper";

export const clockInAttendanceStaff = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const newAttendance = await Attendance.create({
      user_id,
      clock_in: new Date(),
      clock_out: null,
    });

    return res.status(201).json({ message: "Clock in success", data: newAttendance });
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
    const userId = req.query.user_id as string | undefined;
    const whereClause = userId ? { user_id: userId } : undefined;
    const attendanceData = await Attendance.findAll({ where: whereClause });

    return res.status(200).json({ message: "Attendance fetched", data: attendanceData });
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

    const attendanceData = await Attendance.create({
      user_id: userId,
      clock_in: new Date(),
      clock_out: null,
    });

    console.log('[clockInByQrScan] Success for user:', userId);
    return res.status(201).json({ message: "Clock in by QR success", data: attendanceData });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[clockInByQrScan] Error:', errorMsg);
    return res.status(500).json({ message: "Failed to clock in by QR: " + errorMsg });
  }
};
