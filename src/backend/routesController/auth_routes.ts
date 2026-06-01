import express from "express";
import { loginWebAdminManagerOnly, logoutWeb, resetPasswordStaff } from "../controllers/user_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const AuthRouter = express.Router();

AuthRouter.post("/auth/login", controllerWrapper(loginWebAdminManagerOnly));
AuthRouter.post("/auth/logout", authenticateJWT, controllerWrapper(logoutWeb));
AuthRouter.put("/auth/users/:email/reset-password", controllerWrapper(resetPasswordStaff));

export default AuthRouter;
