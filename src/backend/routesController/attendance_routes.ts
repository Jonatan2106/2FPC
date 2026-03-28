import express from "express";
import {
  clockInByQrScan,
  clockOutAttendanceStaff,
  generateAttendanceQr,
  getAttendanceData,
  updateAttendanceAdmin,
} from "../controllers/attendance_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const AttendanceRouter = express.Router();

AttendanceRouter.post("/attendance/clock-in/qr-scan", authenticateJWT, controllerWrapper(clockInByQrScan));
AttendanceRouter.get("/attendance/qr", authenticateJWT, controllerWrapper(generateAttendanceQr));
AttendanceRouter.delete("/attendance/:id/clock-out", authenticateJWT, controllerWrapper(clockOutAttendanceStaff));
AttendanceRouter.get("/attendance", authenticateJWT, controllerWrapper(getAttendanceData));
AttendanceRouter.put("/admin/attendance/:id", authenticateJWT, controllerWrapper(updateAttendanceAdmin));

export default AttendanceRouter;
