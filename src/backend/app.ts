import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ApiRouter from "./routes";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "config/.env") });

const app = express();

// Konfigurasi CORS yang presisi & mendukung preflight request
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : "*";

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Menangani Preflight OPTIONS request secara global
app.options("*", cors());

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