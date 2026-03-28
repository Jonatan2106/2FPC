import express from "express";
import {
  approveOrDeclineLeaveManager,
  createLeaveRequestStaff,
  getLeaveTimelineAdmin,
} from "../controllers/leave_management_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const LeaveManagementRouter = express.Router();

LeaveManagementRouter.post("/leave-requests", authenticateJWT, controllerWrapper(createLeaveRequestStaff));
LeaveManagementRouter.post("/manager/leave-requests/:id/decision", authenticateJWT, controllerWrapper(approveOrDeclineLeaveManager));
LeaveManagementRouter.get("/admin/leave-requests/timeline", authenticateJWT, controllerWrapper(getLeaveTimelineAdmin));

export default LeaveManagementRouter;
