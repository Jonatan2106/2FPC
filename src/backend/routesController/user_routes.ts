import express from "express";
import {
  createStaffAccountAdmin,
  updateOwnProfileStaff,
  updateUserProfileAdmin,
  getAllUsersAdmin,
  getUserByIdAdmin,
  verifyQrCode,
  getUserQrCode,
} from "../controllers/user_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const UserRouter = express.Router();

UserRouter.post("/admin/users/staff-account", authenticateJWT, controllerWrapper(createStaffAccountAdmin));
UserRouter.put("/admin/users/:id", authenticateJWT, controllerWrapper(updateUserProfileAdmin));
UserRouter.get("/admin/users", authenticateJWT, controllerWrapper(getAllUsersAdmin));
UserRouter.get("/admin/users/:id", authenticateJWT, controllerWrapper(getUserByIdAdmin));
UserRouter.put("/staff/users/:id/profile", authenticateJWT, controllerWrapper(updateOwnProfileStaff));

// QR Code endpoints
UserRouter.post("/qr/verify", controllerWrapper(verifyQrCode));
UserRouter.get("/qr/:id", controllerWrapper(getUserQrCode));

export default UserRouter;
