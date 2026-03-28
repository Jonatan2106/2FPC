import type { Request, Response } from "express";
import { departement as Department } from "../../../models/departements";
import { staff_detail as StaffDetail } from "../../../models/staff_details";

export const createUserManagementTreeAdmin = async (req: Request, res: Response) => {
  try {
    const { departement_name, manager_user_id, staff_user_ids = [] } = req.body;

    if (!departement_name) {
      return res.status(400).json({ message: "departement_name is required" });
    }

    const newDepartement = await Department.create({
      company_name: departement_name,
      company_email: `${String(departement_name).toLowerCase().replace(/\s+/g, "")}.local@company.com`,
      password: "dept-default-password",
    });

    if (manager_user_id) {
      await StaffDetail.update(
        { departement_id: newDepartement.departement_id, role: "Manager" },
        { where: { user_id: manager_user_id } }
      );
    }

    if (Array.isArray(staff_user_ids) && staff_user_ids.length > 0) {
      await StaffDetail.update(
        { departement_id: newDepartement.departement_id, role: "Staff" },
        { where: { user_id: staff_user_ids } }
      );
    }

    return res.status(201).json({
      message: "User management tree created",
      data: {
        departement_id: newDepartement.departement_id,
        manager_user_id,
        staff_user_ids,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create user management tree", error });
  }
};

export const updateUserManagementTreeAdmin = async (req: Request, res: Response) => {
  try {
    const treeId = String(req.params.id);
    const targetDepartement = await Department.findByPk(treeId);
    if (!targetDepartement) {
      return res.status(404).json({ message: "Departement not found" });
    }

    const { departement_name, manager_user_id, staff_user_ids } = req.body;

    if (departement_name) {
      await targetDepartement.update({ company_name: departement_name });
    }

    if (manager_user_id) {
      await StaffDetail.update(
        { departement_id: treeId, role: "Manager" },
        { where: { user_id: manager_user_id } }
      );
    }

    if (Array.isArray(staff_user_ids)) {
      await StaffDetail.update(
        { departement_id: treeId, role: "Staff" },
        { where: { user_id: staff_user_ids } }
      );
    }

    return res.status(200).json({ message: "User management tree updated", data: targetDepartement });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user management tree", error });
  }
};
