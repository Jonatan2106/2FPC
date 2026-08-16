import type { Request, Response } from "express";
import { user as User } from "../../../models/user";
import { staff_detail as StaffDetail } from "../../../models/staff_details";
import { departement as Department } from "../../../models/departements";
import { leave_management as LeaveManagement } from "../../../models/leave_management";
import { reimburse as Reimbursement } from "../../../models/reimburse";
import { attendance as Attendance } from "../../../models/attendance";
import { payroll as Payroll } from "../../../models/payroll";
import { penalty as Penalty } from "../../../models/penalty";

const getRequesterAccess = async (req: Request) => {
  const requesterId = req.headers["x-user-id"] as string | undefined;
  const requesterRole = req.headers["x-user-role"] as string | undefined;

  if (!requesterId) {
    return null;
  }

  if (requesterRole === "Admin") {
    return { role: "Admin" as const, departementId: null };
  }

  const requester = await User.findByPk(requesterId, {
    include: [
      {
        model: StaffDetail,
        attributes: ["role", "departement_id"],
      },
    ],
  });

  return {
    role: requester?.staff_detail?.role === "Manager" ? "Manager" : "Staff",
    departementId: requester?.staff_detail?.departement_id ?? null,
  };
};

export const createDepartmentAdmin = async (req: Request, res: Response) => {
  try {
    const {
      company_name,
      company_email,
      password,
      address,
      website,
      logo_url,
      description,
      industry,
    } = req.body;

    if (!company_name || !company_email || !password) {
      return res
        .status(400)
        .json({ message: "company_name, company_email, and password are required" });
    }

    const existingDepartment = await Department.findOne({ where: { company_email } });
    if (existingDepartment) {
      return res.status(409).json({ message: "Department email already exists" });
    }

    const newDepartment = await Department.create({
      company_name,
      company_email,
      password,
      address: address ?? null,
      website: website ?? null,
      logo_url: logo_url ?? null,
      description: description ?? null,
      industry: industry ?? null,
    });

    return res.status(201).json({ message: "Department created", data: newDepartment });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create department", error });
  }
};

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const access = await getRequesterAccess(req);
    const departments = await Department.findAll({ order: [["createdAt", "DESC"]] });
    const visibleDepartments =
      access?.role === "Admin"
        ? departments
        : departments.filter((department) => department.departement_id === access?.departementId);
    return res.status(200).json({ message: "Departments fetched", data: visibleDepartments });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch departments", error });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const access = await getRequesterAccess(req);
    const departmentId = String(req.params.id);
    const department = await Department.findByPk(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (access?.role !== "Admin" && department.departement_id !== access?.departementId) {
      return res.status(403).json({ message: "You can only access your own department" });
    }

    return res.status(200).json({ message: "Department fetched", data: department });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch department", error });
  }
};

export const updateDepartmentAdmin = async (req: Request, res: Response) => {
  try {
    const departmentId = String(req.params.id);
    const department = await Department.findByPk(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const allowedFields = [
      "company_name",
      "company_email",
      "password",
      "address",
      "website",
      "logo_url",
      "description",
      "industry",
    ] as const;

    const payload: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    await department.update(payload);
    return res.status(200).json({ message: "Department updated", data: department });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update department", error });
  }
};

export const deleteDepartmentAdmin = async (req: Request, res: Response) => {
  try {
    const departmentId = String(req.params.id);
    const department = await Department.findByPk(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // 1. Cari semua staff/user yang memiliki departement_id ini melalui tabel StaffDetail
    const staffDetails = await StaffDetail.findAll({
      where: { departement_id: departmentId },
    });

    // Ambil semua user_id dari staff tersebut
    const userIds = staffDetails.map((staff) => staff.user_id);

    if (userIds.length > 0) {
      // 2. Hapus data relasi dari tabel-tabel terkait milik para user tersebut 
      // (Sesuaikan nama model Sequelize Anda: LeaveManagement, Attendance, Reimbursement, dll)
      await LeaveManagement.destroy({ where: { user_id: userIds } }).catch(() => {});
      await Reimbursement.destroy({ where: { user_id: userIds } }).catch(() => {});
      await Attendance.destroy({ where: { user_id: userIds } }).catch(() => {});
      await Payroll.destroy({ where: { user_id: userIds } }).catch(() => {});
      await Penalty.destroy({ where: { user_id: userIds } }).catch(() => {});

      // 3. Hapus data staff_details mereka
      await StaffDetail.destroy({
        where: { departement_id: departmentId },
      });

      // 4. Hapus akun utamanya dari tabel users
      await User.destroy({
        where: { user_id: userIds },
      });
    }

    // 5. Terakhir, hapus departemen itu sendiri
    await department.destroy();

    return res.status(200).json({ 
      message: "Department and all associated users/records deleted successfully" 
    });
  } catch (error) {
    console.error("[deleteDepartmentAdmin] Error:", error);
    return res.status(500).json({ message: "Failed to delete department and associated users", error });
  }
};
