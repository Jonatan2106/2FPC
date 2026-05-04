import express from "express";
import { loginStaffOrManager, logoutWeb, resetPasswordStaff } from "../controllers/user_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const AuthRouter = express.Router();

AuthRouter.post("/auth/login", controllerWrapper(loginStaffOrManager));
AuthRouter.post("/auth/logout", authenticateJWT, controllerWrapper(logoutWeb));
AuthRouter.put("/auth/users/:id/reset-password", authenticateJWT, controllerWrapper(resetPasswordStaff));

export default AuthRouter;
