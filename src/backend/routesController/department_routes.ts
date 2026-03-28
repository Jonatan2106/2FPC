import express from "express";
import {
  createDepartmentAdmin,
  deleteDepartmentAdmin,
  getAllDepartments,
  getDepartmentById,
  updateDepartmentAdmin,
} from "../controllers/department_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const DepartmentRouter = express.Router();

DepartmentRouter.post("/admin/departments", authenticateJWT, controllerWrapper(createDepartmentAdmin));
DepartmentRouter.get("/departments", authenticateJWT, controllerWrapper(getAllDepartments));
DepartmentRouter.get("/departments/:id", authenticateJWT, controllerWrapper(getDepartmentById));
DepartmentRouter.put("/admin/departments/:id", authenticateJWT, controllerWrapper(updateDepartmentAdmin));
DepartmentRouter.delete("/admin/departments/:id", authenticateJWT, controllerWrapper(deleteDepartmentAdmin));

export default DepartmentRouter;
