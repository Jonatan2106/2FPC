import type { Request, Response } from "express";
import { departement as Department } from "../../../models/departements";

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

export const getAllDepartments = async (_req: Request, res: Response) => {
  try {
    const departments = await Department.findAll({ order: [["createdAt", "DESC"]] });
    return res.status(200).json({ message: "Departments fetched", data: departments });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch departments", error });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const departmentId = String(req.params.id);
    const department = await Department.findByPk(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
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

    await department.destroy();
    return res.status(200).json({ message: "Department deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete department", error });
  }
};
