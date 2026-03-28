import type { Request, Response } from "express";
import QRCode from "qrcode";
import { attendance as Attendance } from "../../../models/attendance";
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
    const userId = (req.headers["x-user-id"] as string) || req.body.user_id;
    if (!userId) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const qrToken = generateAttendanceQrToken(userId);
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
    if (!qr_token) {
      return res.status(400).json({ message: "qr_token is required" });
    }

    const payload = verifyToken(qr_token);
    if (!payload || payload.purpose !== "attendance_qr") {
      return res.status(400).json({ message: "Invalid or expired QR token" });
    }

    const openAttendance = await Attendance.findOne({
      where: {
        user_id: payload.userId,
        clock_out: null,
      },
      order: [["createdAt", "DESC"]],
    });

    if (openAttendance) {
      return res.status(409).json({ message: "User already clocked in and not clocked out yet" });
    }

    const attendanceData = await Attendance.create({
      user_id: payload.userId,
      clock_in: new Date(),
      clock_out: null,
    });

    return res.status(201).json({ message: "Clock in by QR success", data: attendanceData });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clock in by QR", error });
  }
};
