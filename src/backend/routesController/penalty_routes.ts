import express from "express";
import { createPenalty } from "../controllers/penalty_controllers";
import { authenticateJWT } from "../middleware/auth_middleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const PenaltyRouter = express.Router();

PenaltyRouter.post("/penalties", authenticateJWT, controllerWrapper(createPenalty));

export default PenaltyRouter;
