import express from "express";
import { createStaffSalaryAdmin, generatePayroll, getPayrollSummary, markPayrollPaid } from "../controllers/payroll_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const PayrollRouter = express.Router();

PayrollRouter.post("/payroll/generate", authenticateJWT, controllerWrapper(generatePayroll));
PayrollRouter.post("/payroll/pay", authenticateJWT, controllerWrapper(markPayrollPaid));
PayrollRouter.get("/payroll/summary", authenticateJWT, controllerWrapper(getPayrollSummary));
PayrollRouter.post("/admin/staff-salary", authenticateJWT, controllerWrapper(createStaffSalaryAdmin));

export default PayrollRouter;
