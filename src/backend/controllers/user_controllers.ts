import type { Request, Response } from "express";
import { user as User } from "../../../models/user";
import { departement as Departement } from "../../../models/departements";
import { staff_detail as StaffDetail } from "../../../models/staff_details";
import { leave_management as LeaveManagement } from "../../../models/leave_management";
import { reimburse as Reimbursement } from "../../../models/reimburse";
import { attendance as Attendance } from "../../../models/attendance";
import { penalty as Penalty } from "../../../models/penalty";
import { user as UserModel } from "../../../models/user";
import { generateToken } from "../utils/jwt_helper";
import bcrypt from "bcrypt";
import {
  generateUserQrCode,
  generateQrImage,
  checkDeviceLock,
  saveUserQrAndDevice,
  verifyUserQrCode,
} from "../utils/qr_device_helper";

type StaffRole = "Manager" | "Staff";
type EffectiveRole = "Admin" | StaffRole;

const resolveEffectiveRole = async (existingUser: User): Promise<EffectiveRole> => {
  if (existingUser.type === "Admin") {
    return "Admin";
  }

  const staffDetail = await StaffDetail.findOne({
    where: { user_id: existingUser.user_id },
  });

  return staffDetail?.role === "Manager" ? "Manager" : "Staff";
};

const resolveEffectiveDepartment = async (userId: string): Promise<string> => {
  const staffDetail = await StaffDetail.findOne({
    where: { user_id: userId },
    raw: true,
    attributes: ["departement_name"],
  });

  // Mengembalikan nama departemen atau string kosong jika tidak ditemukan
  return staffDetail?.departement_name ?? "";
};

const buildLoginPayload = async (existingUser: User, role: EffectiveRole, token: string, qrData: string, qrImage: string, deviceId: string | null) => {
  const departmentName = await resolveEffectiveDepartment(existingUser.user_id);
  const staffDetail = await StaffDetail.findOne({ where: { user_id: existingUser.user_id } });

  return {
    user_id: existingUser.user_id,
    name: existingUser.name,
    email: existingUser.email,
    alamat: existingUser.alamat,
    nomor_telepon: existingUser.nomor_telepon,
    foto: existingUser.foto,
    type: existingUser.type,
    role,
    salary: existingUser.salary,
    department_id: staffDetail?.departement_id ?? null,
    department_name: departmentName, // <-- Langsung bersih menggunakan fungsi penresolve
    staff_detail: {
      role,
      departement_id: staffDetail?.departement_id ?? null,
      departement_name: departmentName,
    },
    token,
    qr_code: qrData,
    qr_image: qrImage,
    device_id: deviceId,
    qr_expires_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
  };
};

const getRequesterAccess = async (req: Request) => {
  const requesterId = req.headers["x-user-id"] as string | undefined;
  const requesterRole = req.headers["x-user-role"] as string | undefined;

  if (!requesterId) {
    return null;
  }

  if (requesterRole === "Admin") {
    return { role: "Admin" as const, departementId: null };
  }

  const requester = await UserModel.findByPk(requesterId, {
    include: [
      {
        model: StaffDetail,
        attributes: ["role", "departement_id"],
      },
    ],
  });

  return {
    role: (requester?.staff_detail?.role === "Manager" ? "Manager" : "Staff") as StaffRole,
    departementId: requester?.staff_detail?.departement_id ?? null,
  };
};

const isHumanResourcesManager = async (departementId: string | null | undefined): Promise<boolean> => {
  if (!departementId) {
    return false;
  }

  const departement = await Departement.findByPk(departementId, {
    attributes: ["company_name"],
  });

  const normalizedName = String(departement?.company_name || "")
    .trim()
    .toLowerCase();

  return normalizedName === "human resources" || normalizedName === "hr";
};

const getDepartementDisplayName = async (departementId?: string | null): Promise<string | null> => {
  if (!departementId) {
    return null;
  }

  const departement = await Departement.findByPk(departementId, {
    attributes: ["company_name"],
  });

  return departement?.company_name ?? null;
};

const handleLogin = async (req: Request, res: Response, channel: "web" | "mobile") => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const username = (req.query.username as string) || (body.username as string) || "";
    const password = (req.query.password as string) || (body.password as string) || "";
    const deviceId = (req.query.device_id as string) || (body.device_id as string) || null;

    if (!username || !password) {
      return res.status(400).json({
        message: "username and password are required",
      });
    }

    const existingUser = await User.findOne({
      where: { name: username },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const effectiveRole = await resolveEffectiveRole(existingUser);

    if (channel === "web" && effectiveRole === "Staff") {
      return res.status(403).json({
        message: "Staff tidak dapat login ke web. Gunakan aplikasi mobile.",
      });
    }

    const qrData = await generateUserQrCode(existingUser.user_id);
    const qrImage = await generateQrImage(qrData);

    // INI KODE BARU YANG HARUS KAMU PASANG DI NODE.JS
    if (channel === "mobile") {

      // LAPIS 1: Akun A hanya boleh login di HP A
      if (existingUser.device_id && existingUser.device_id !== deviceId) {
        return res.status(403).json({
          message: `Akun ini hanya boleh login di satu device aplikasi. Gunakan device yang sama atau lapor ke Admin untuk reset sesi.`,
          data: {
            lockedDeviceId: existingUser.device_id,
          },
        });
      }

      // LAPIS 2: HP A tidak bisa dipakai oleh Akun B
      if (deviceId) {
        const lockStatus = await checkDeviceLock(deviceId, existingUser.user_id);
        if (lockStatus.isLocked) {
          return res.status(403).json({
            message: `Device ini sudah terdaftar untuk pengguna lain (${lockStatus.lockedUsername}). Satu device hanya untuk satu akun.`,
            data: {
              lockedUserId: lockStatus.lockedUserId,
              lockedUsername: lockStatus.lockedUsername,
            },
          });
        }
      }

      // Simpan device ID jika lolos
      await saveUserQrAndDevice(existingUser.user_id, qrData, deviceId);
    }

    const token = generateToken({
      userId: existingUser.user_id,
      username: existingUser.name,
      role: effectiveRole,
      purpose: "auth",
    });

    return res.status(200).json({
      message: "Login success",
      data: await buildLoginPayload(existingUser, effectiveRole, token, qrData, qrImage, deviceId),
    });
  } catch (error) {
    console.error("[handleLogin] Error:", error);
    const errMsg = error instanceof Error ? error.message : error;
    return res.status(500).json({
      message: "Failed to login",
      error: errMsg,
    });
  }
};

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
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("changeme123", saltRounds);
    const departementName = await getDepartementDisplayName(departement_id || null);

    const newUser = await User.create({
      name: username,
      email,
      password: hashedPassword,
      type: "Staff",
    });

    await StaffDetail.create({
      user_id: newUser.user_id,
      name: newUser.name,
      departement_name: departementName,
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
    const access = await getRequesterAccess(req);

    if (!access) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (access.role !== "Admin") {
      const targetStaff = await StaffDetail.findByPk(userId);
      if (targetStaff?.departement_id !== access.departementId) {
        return res.status(403).json({
          message: "You can only modify users in your own department",
        });
      }
    }

    const canEditType = access.role === "Admin";

    const allowedFields: string[] = [
      "name",
      "email",
      "alamat",
      "nomor_telepon",
      "foto",
      "salary",
    ];

    if (canEditType) {
      allowedFields.push("type");
    }

    const payload: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    if (!canEditType && req.body.type !== undefined) {
      return res.status(403).json({
        message: "Only Admin can update user type",
      });
    }

    await targetUser.update(payload);

    console.log('[updateUserProfileAdmin] updating user', targetUser.user_id, 'with payload', payload);

    if (payload.name !== undefined) {
      await StaffDetail.update(
        { name: payload.name as string },
        { where: { user_id: targetUser.user_id } }
      );
    }

    await targetUser.reload();

    return res.status(200).json({ message: "User profile updated", data: targetUser });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user profile", error });
  }
};

export const deleteUserAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(id);

    const access = await getRequesterAccess(req);
    if (!access) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const targetUser = await User.findByPk(userId, {
      include: [{ model: StaffDetail }],
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (access.role !== "Admin") {
      if (targetUser.staff_detail?.departement_id !== access.departementId) {
        return res.status(403).json({
          message: "You can only delete users in your own department",
        });
      }
    }

    // --- TAMBAHKAN PENGHAPUSAN TABEL TERKAIT DI SINI ---
    // Sesuaikan nama model Sequelize-nya dengan yang ada di project Anda (misal: LeaveManagement, Reimbursement, dll)
    await LeaveManagement.destroy({ where: { user_id: userId } }).catch(() => {});
    await Reimbursement.destroy({ where: { user_id: userId } }).catch(() => {});
    await Attendance.destroy({ where: { user_id: userId } }).catch(() => {});
    await Penalty.destroy({ where: { user_id: userId } }).catch(() => {});
    // --------------------------------------------------

    // Hapus data staff_detail
    await StaffDetail.destroy({
      where: { user_id: userId },
    });

    // Terakhir, hapus user utama
    await targetUser.destroy();

    return res.status(200).json({
      message: "User and associated records deleted successfully",
    });
  } catch (error) {
    console.error("[deleteUserAdmin] Error:", error);
    return res.status(500).json({
      message: "Failed to delete user and associated records",
      error,
    });
  }
};

export const updateOwnProfileStaff = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, alamat, nomor_telepon, foto } = req.body;

    await targetUser.update({
      name: name ?? targetUser.name,
      alamat: alamat ?? targetUser.alamat,
      nomor_telepon: nomor_telepon ?? targetUser.nomor_telepon,
      foto: foto ?? targetUser.foto,
    });

    if (name !== undefined) {
      await StaffDetail.update(
        { name: targetUser.name },
        { where: { user_id: targetUser.user_id } }
      );
    }

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
  return handleLogin(req, res, "mobile");
};

export const loginWebAdminManagerOnly = async (req: Request, res: Response) => {
  return handleLogin(req, res, "web");
};

export const resetPasswordStaff = async (req: Request, res: Response) => {
  try {
    // Ambil email dari URL params (karena di route pakai :email)
    const { email } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "newPassword is required" });
    }

    const existingUser = await User.findOne({ where: { email: email } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password before saving it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await existingUser.update({ password: hashedPassword });

    return res.status(200).json({ message: "Password reset success" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reset password", error });
  }
};

export const logoutWeb = async (_req: Request, res: Response) => {
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

export const getAllUsersAdmin = async (req: Request, res: Response) => {
  try {
    const access = await getRequesterAccess(req);

    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: StaffDetail,
          attributes: ["role", "departement_id", "hire_date"],
          include: [
            {
              model: Departement,
              attributes: ["company_name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const visibleUsers =
      access?.role === "Admin"
        ? users
        : users.filter(
          (user) => user.staff_detail?.departement_id === access?.departementId
        );

    return res.status(200).json({
      message: "Users fetched",
      data: visibleUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users",
      error,
    });
  }
};

export const getUserByIdAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(id);
    const access = await getRequesterAccess(req);

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: StaffDetail,
          attributes: ["role", "departement_id", "hire_date"],
          include: [
            {
              model: Departement,
              attributes: ["company_name"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      access?.role !== "Admin" &&
      user.staff_detail?.departement_id !== access?.departementId
    ) {
      return res.status(403).json({
        message: "You can only access users in your own department",
      });
    }

    return res.status(200).json({
      message: "User fetched",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user",
      error,
    });
  }
};

export const updateStaffDetailsAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(id);

    const access = await getRequesterAccess(req);

    // Find existing staff detail
    let staff = await StaffDetail.findByPk(userId);

    if (!staff) {
      // If not exists, create a new staff_detail row (but keep name null)
      staff = await StaffDetail.create({
        user_id: userId,
        name: null,
        departement_name: null,
        role: "Staff",
        departement_id: null,
      });
    }

    if (access?.role !== "Admin" && staff.departement_id !== access?.departementId) {
      return res.status(403).json({ message: "You can only modify staff in your own department" });
    }

    if (!access) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role, departement_id } = req.body as { role?: "Manager" | "Staff"; departement_id?: string };

    const requesterIsHRManager =
      access.role === "Manager" &&
      (await isHumanResourcesManager(access.departementId));

    const canEditRole = access.role === "Admin" || requesterIsHRManager;

    if (!canEditRole && role !== undefined) {
      return res.status(403).json({
        message: "You do not have permission to update role",
      });
    }

    const updates: Record<string, any> = {};
    if (role !== undefined && canEditRole) {
      updates.role = role === "Manager" ? "Manager" : "Staff";
    }
    if (departement_id !== undefined) {
      updates.departement_id = departement_id || null;
      updates.departement_name = await getDepartementDisplayName(departement_id || null);
    }

    if (Object.keys(updates).length > 0) {
      await staff.update(updates);
      await staff.reload();
    }

    return res.status(200).json({ message: "Staff details updated", data: staff });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update staff details", error });
  }
};