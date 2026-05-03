import type { Request, Response } from "express";
import { user as User } from "../../../models/user";
import { staff_detail as StaffDetail } from "../../../models/staff_details";
import { generateToken } from "../utils/jwt_helper";

type StaffRole = "Manager" | "Staff";

export const createStaffAccountAdmin = async (req: Request, res: Response) => {
  try {
    const { username, role = "Staff", department_id } = req.body as {
      username?: string;
      role?: StaffRole;
      department_id?: string;
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
      ...(department_id && { departement_id: department_id }),
    });

    return res.status(201).json({
      message: "Staff account created",
      data: {
        user_id: newUser.user_id,
        username: newUser.name,
        role: normalizedRole,
        department_id: department_id || null,
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
    const username = (req.query.username as string) || "";
    const password = (req.query.password as string) || "";

    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    const existingUser = await User.findOne({ where: { name: username } });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

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
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login", error });
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

