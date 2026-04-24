import express from "express";
import MobileRouter from "./mobile_routes";
import WebRouter from "./web_routes";

const ApiRouter = express.Router();

ApiRouter.use("/web", WebRouter);
ApiRouter.use("/mobile", MobileRouter);

export default ApiRouter;
