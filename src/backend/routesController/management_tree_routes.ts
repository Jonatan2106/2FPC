import express from "express";
import {
  createUserManagementTreeAdmin,
  updateUserManagementTreeAdmin,
} from "../controllers/management_tree_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const ManagementTreeRouter = express.Router();

ManagementTreeRouter.post("/admin/management-tree", authenticateJWT, controllerWrapper(createUserManagementTreeAdmin));
ManagementTreeRouter.put("/admin/management-tree/:id", authenticateJWT, controllerWrapper(updateUserManagementTreeAdmin));

export default ManagementTreeRouter;
