import express from "express";
import {
  approveOrDeclineReimburseManager,
  createReimburseRequestStaff,
} from "../controllers/reimburse_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const ReimburseRouter = express.Router();

ReimburseRouter.post("/reimburse-requests", authenticateJWT, controllerWrapper(createReimburseRequestStaff));
ReimburseRouter.post("/manager/reimburse-requests/:id/decision", authenticateJWT, controllerWrapper(approveOrDeclineReimburseManager));

export default ReimburseRouter;
