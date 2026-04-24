import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ApiRouter from "./routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok", service: "attendance-backend" });
});

app.use("/api", ApiRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

export default app;
