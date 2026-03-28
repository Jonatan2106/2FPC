import express from "express";
import {
  createStaffAccountAdmin,
  updateOwnProfileStaff,
  updateUserProfileAdmin,
} from "../controllers/user_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const UserRouter = express.Router();

UserRouter.post("/admin/users/staff-account", authenticateJWT, controllerWrapper(createStaffAccountAdmin));
UserRouter.put("/admin/users/:id", authenticateJWT, controllerWrapper(updateUserProfileAdmin));
UserRouter.put("/staff/users/:id/profile", authenticateJWT, controllerWrapper(updateOwnProfileStaff));

export default UserRouter;
