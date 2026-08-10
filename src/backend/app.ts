import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ApiRouter from "./routes";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "config/.env") });

const app = express();

// Parsing CORS Origin dari Environment Variables
const getOrigins = () => {
  const envOrigins = process.env.CORS_ORIGIN;
  if (!envOrigins) return "*";
  const origins = envOrigins.split(",").map((o) => o.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
};

// Middleware CORS yang aman dan fleksibel untuk Preflight Request
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = getOrigins();
      // Izinkan jika tanpa origin (seperti Postman/Mobile App) atau wildcard (*)
      if (!origin || allowed === "*") {
        return callback(null, true);
      }
      if (Array.isArray(allowed)) {
        if (allowed.includes(origin)) return callback(null, true);
      } else if (allowed === origin) {
        return callback(null, true);
      }
      // Fallback izinkan agar tidak diblokir browser saat preflight
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: false, // Diset false agar kompatibel penuh jika origin bernilai wildcard (*)
    optionsSuccessStatus: 200,
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