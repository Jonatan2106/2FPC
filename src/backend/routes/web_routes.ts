import express from "express";
import AttendanceRouter from "../routesController/attendance_routes";
import AuthRouter from "../routesController/auth_routes";
import DepartmentRouter from "../routesController/department_routes";
import LeaveManagementRouter from "../routesController/leave_management_routes";
import ManagementTreeRouter from "../routesController/management_tree_routes";
import PayrollRouter from "../routesController/payroll_routes";
import PenaltyRouter from "../routesController/penalty_routes";
import ReimburseRouter from "../routesController/reimburse_routes";
import UserRouter from "../routesController/user_routes";

const WebRouter = express.Router();

WebRouter.use(AuthRouter);
WebRouter.use(UserRouter);
WebRouter.use(DepartmentRouter);
WebRouter.use(ManagementTreeRouter);
WebRouter.use(AttendanceRouter);
WebRouter.use(LeaveManagementRouter);
WebRouter.use(ReimburseRouter);
WebRouter.use(PayrollRouter);
WebRouter.use(PenaltyRouter);

export default WebRouter;

