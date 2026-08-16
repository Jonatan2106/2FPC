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

DepartmentRouter.post("/admin/departements", authenticateJWT, controllerWrapper(createDepartmentAdmin));
DepartmentRouter.get("/departements", authenticateJWT, controllerWrapper(getAllDepartments));
DepartmentRouter.get("/departements/:id", authenticateJWT, controllerWrapper(getDepartmentById));
DepartmentRouter.put("/admin/departements/:id", authenticateJWT, controllerWrapper(updateDepartmentAdmin));
DepartmentRouter.delete("/admin/departements/:id", authenticateJWT, controllerWrapper(deleteDepartmentAdmin));

export default DepartmentRouter;
