import express from "express";
import {
  approveOrDeclineLeaveManager,
  createLeaveRequestStaff,
  getLeaveTimelineAdmin,
  getAllLeaveRequests,
  getPendingLeaveRequests,
  getPendingRequestsActivity,
  getLeaveRequestById,
} from "../controllers/leave_management_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const LeaveManagementRouter = express.Router();

LeaveManagementRouter.post("/leave-requests", authenticateJWT, controllerWrapper(createLeaveRequestStaff));
LeaveManagementRouter.get("/all-leave-requests", authenticateJWT, controllerWrapper(getAllLeaveRequests));
LeaveManagementRouter.get("/pending-leave-requests", authenticateJWT, controllerWrapper(getPendingLeaveRequests));
LeaveManagementRouter.get("/pending-requests-activity", authenticateJWT, controllerWrapper(getPendingRequestsActivity));
LeaveManagementRouter.get("/leave-requests/:id", authenticateJWT, controllerWrapper(getLeaveRequestById));
LeaveManagementRouter.post("/manager/leave-requests/:id/decision", authenticateJWT, controllerWrapper(approveOrDeclineLeaveManager));
LeaveManagementRouter.get("/admin/leave-requests/timeline", authenticateJWT, controllerWrapper(getLeaveTimelineAdmin));

export default LeaveManagementRouter;
