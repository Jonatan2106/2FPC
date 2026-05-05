import express from "express";
import {
  approveOrDeclineReimburseManager,
  createReimburseRequestStaff,
  getAllReimburseRequests,
  getPendingReimburseRequests,
  getReimburseRequestById,
} from "../controllers/reimburse_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const ReimburseRouter = express.Router();

ReimburseRouter.post("/reimburse-requests", authenticateJWT, controllerWrapper(createReimburseRequestStaff));
ReimburseRouter.get("/all-reimburse-requests", authenticateJWT, controllerWrapper(getAllReimburseRequests));
ReimburseRouter.get("/pending-reimburse-requests", authenticateJWT, controllerWrapper(getPendingReimburseRequests));
ReimburseRouter.get("/reimburse-requests/:id", authenticateJWT, controllerWrapper(getReimburseRequestById));
ReimburseRouter.post("/manager/reimburse-requests/:id/decision", authenticateJWT, controllerWrapper(approveOrDeclineReimburseManager));

export default ReimburseRouter;
