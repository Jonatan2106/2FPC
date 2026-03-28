import express from "express";
import { loginStaffOrManager } from "../controllers/user_controllers";
import { clockInByQrScan, clockOutAttendanceStaff, generateAttendanceQr, getAttendanceData } from "../controllers/attendance_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const MobileRouter = express.Router();

// Mobile app is scoped for attendance flow only.
MobileRouter.get("/auth/login", controllerWrapper(loginStaffOrManager));
MobileRouter.get("/attendance/qr", authenticateJWT, controllerWrapper(generateAttendanceQr));
MobileRouter.post("/attendance/clock-in/qr-scan", authenticateJWT, controllerWrapper(clockInByQrScan));
MobileRouter.delete("/attendance/:id/clock-out", authenticateJWT, controllerWrapper(clockOutAttendanceStaff));
MobileRouter.get("/attendance", authenticateJWT, controllerWrapper(getAttendanceData));

export default MobileRouter;
