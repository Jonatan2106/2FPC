import type { Request, Response } from "express";
import { user as User } from "../../../models/user";
import { staff_detail as StaffDetail } from "../../../models/staff_details";
import { generateToken } from "../utils/jwt_helper";
import {
  generateUserQrCode,
  generateQrImage,
  checkDeviceLock,
  saveUserQrAndDevice,
  verifyUserQrCode,
} from "../utils/qr_device_helper";

type StaffRole = "Manager" | "Staff";

export const createStaffAccountAdmin = async (req: Request, res: Response) => {
  try {
    const { username, role = "Staff", departement_id } = req.body as {
      username?: string;
      role?: StaffRole;
      departement_id?: string;
    };

    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }

    const normalizedRole: StaffRole = role === "Manager" ? "Manager" : "Staff";
    const email = `${username.toLowerCase().replace(/\s+/g, ".")}@company.local`;
    const defaultPassword = "changeme123";

    const newUser = await User.create({
      name: username,
      email,
      password: defaultPassword,
      type: "Staff",
    });

    await StaffDetail.create({
      user_id: newUser.user_id,
      role: normalizedRole,
      departement_id: departement_id || null,
    });

    return res.status(201).json({
      message: "Staff account created",
      data: {
        user_id: newUser.user_id,
        username: newUser.name,
        role: normalizedRole,
        departement_id: departement_id || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create staff account", error });
  }
};

export const updateUserProfileAdmin = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFields = [
      "name",
      "email",
      "alamat",
      "nomor_telepon",
      "foto",
      "salary",
      "type",
    ] as const;

    const payload: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    await targetUser.update(payload);
    return res.status(200).json({ message: "User profile updated", data: targetUser });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user profile", error });
  }
};

export const updateOwnProfileStaff = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { alamat, nomor_telepon, foto } = req.body;

    await targetUser.update({
      alamat: alamat ?? targetUser.alamat,
      nomor_telepon: nomor_telepon ?? targetUser.nomor_telepon,
      foto: foto ?? targetUser.foto,
    });

    return res.status(200).json({
      message: "Profile updated",
      data: {
        user_id: targetUser.user_id,
        name: targetUser.name,
        alamat: targetUser.alamat,
        nomor_telepon: targetUser.nomor_telepon,
        foto: targetUser.foto,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update own profile", error });
  }
};

export const loginStaffOrManager = async (req: Request, res: Response) => {
  try {
    const username = (req.query.username as string) || (req.body.username as string) || "";
    const password = (req.query.password as string) || (req.body.password as string) || "";
    const deviceId =
      (req.query.device_id as string) || (req.body.device_id as string) || null; // Device identifier (IMEI, Android ID, or generated UUID)

    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    // Find user
    const existingUser = await User.findOne({ where: { name: username } });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    if (existingUser.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check device lock - prevent same device from logging in to multiple accounts per day
    if (deviceId) {
      const lockStatus = await checkDeviceLock(deviceId, existingUser.user_id);
      if (lockStatus.isLocked) {
        return res.status(403).json({
          message: `This device is already logged in to another account (${lockStatus.lockedUsername}) today. Please try again tomorrow.`,
          data: {
            lockedUserId: lockStatus.lockedUserId,
            lockedUsername: lockStatus.lockedUsername,
          },
        });
      }
    }

    // Generate QR code for today
    const qrData = await generateUserQrCode(existingUser.user_id);
    const qrImage = await generateQrImage(qrData);

    // Save QR & device info to user record
    await saveUserQrAndDevice(existingUser.user_id, qrData, deviceId);

    // Generate auth token
    const token = generateToken({
      userId: existingUser.user_id,
      username: existingUser.name,
      role: existingUser.type,
      purpose: "auth",
    });

    return res.status(200).json({
      message: "Login success",
      data: {
        user_id: existingUser.user_id,
        username: existingUser.name,
        type: existingUser.type,
        token,
        qr_code: qrData,
        qr_image: qrImage, // DataURL for immediate display
        device_id: deviceId || null,
        qr_expires_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow 00:00
      },
    });
  } catch (error) {
    console.error("[loginStaffOrManager] Error:", error);
    const errMsg = error instanceof Error ? error.message : error;
    return res.status(500).json({ message: "Failed to login", error: errMsg });
  }
};

export const resetPasswordStaff = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { oldPassword, newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "newPassword is required" });
    }

    if (oldPassword && existingUser.password !== oldPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    await existingUser.update({ password: newPassword });
    return res.status(200).json({ message: "Password reset success" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reset password", error });
  }
};

export const logoutWeb = async (_req: Request, res: Response) => {
  // JWT is stateless; client should remove token from storage.
  return res.status(200).json({ message: "Logout success" });
};

/**
 * Verify QR code for user
 * Used for attendance/absen validation
 */
export const verifyQrCode = async (req: Request, res: Response) => {
  try {
    const { user_id, qr_code } = req.body;

    if (!user_id || !qr_code) {
      return res
        .status(400)
        .json({ message: "user_id and qr_code are required" });
    }

    const validation = await verifyUserQrCode(user_id, qr_code);

    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    return res
      .status(200)
      .json({ message: validation.message, data: { isValid: true } });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to verify QR code", error });
  }
};

/**
 * Get current user QR code (for display in app)
 */
export const getUserQrCode = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id || req.query.user_id);

    if (!userId) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.qr_code) {
      return res
        .status(400)
        .json({ message: "QR code not generated. Please login again." });
    }

    // Generate QR image if needed
    const qrImage = await generateQrImage(user.qr_code);

    return res.status(200).json({
      message: "QR code retrieved",
      data: {
        user_id: user.user_id,
        qr_code: user.qr_code,
        qr_image: qrImage,
        qr_expires_at: user.qr_expires_at,
        device_id: user.device_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get QR code", error });
  }
};

