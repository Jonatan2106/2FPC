import app from "./app";
import { sequelize } from "./config/sequelize";
import { initializeCronJobs } from "./utils/cron_jobs";
import path from "path";


const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    console.log("DB NAME:", process.env.DATABASE_NAME);
    console.log("DB HOST:", process.env.DATABASE_HOST);
  } catch (error) {
    console.warn("⚠️  Database connection failed. Backend will run without database.");
    console.warn("Error:", (error as Error).message);
    console.warn("To fix: Check DATABASE_* env vars in config/.env");
  }

  const server = app.listen(port, host, () => {
    console.log(`✅ Backend running on http://${host}:${port}`);
    console.log(`📱 Mobile app can connect to http://10.19.173.126:${port}/api`);
  });

  // Initialize cron jobs for daily reset
  initializeCronJobs();

  // Handle server errors
  server.on("error", (error: NodeJS.ErrnoException) => {
    console.error("❌ Server error:", error.message);
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use`);
    }
    process.exit(1);
  });
};

// Handle unhandled exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

void startServer();
