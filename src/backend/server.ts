import app from "./app";
import { sequelize } from "./config/sequelize";
import { initializeCronJobs } from "./utils/cron_jobs";

// --- FUNGSI SAPU OTOMATIS (CATCH-UP) ---
const clearExpiredSessions = async () => {
  try {
    console.log("🧹 [Startup] Mengecek sesi dan device ID dari hari kemarin...");
    
    const query = `
      UPDATE users 
      SET qr_code = NULL, 
          qr_expires_at = NULL, 
          device_id = NULL, 
          device_login_date = NULL, 
          last_login_at = NULL 
      WHERE device_login_date < CURRENT_DATE OR qr_expires_at < NOW();
    `;
    
    const [_, metadata] = await sequelize.query(query);
    
    const updatedCount = (metadata as any)?.rowCount ?? 0;
    
    if (updatedCount > 0) {
      console.log(`✅ [Startup] Berhasil me-reset sesi & device untuk ${updatedCount} user.`);
    } else {
      console.log("👍 [Startup] Tidak ada data sesi dari kemarin yang perlu dibersihkan.");
    }
  } catch (error) {
    console.error("❌ [Startup Error] Gagal mereset data sesi:", error);
  }
};
// ---------------------------------------

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    console.log("DB NAME:", process.env.DATABASE_NAME);

    // EKSEKUSI PEMBERSIHAN SETELAH DATABASE SIAP
    await clearExpiredSessions();

  } catch (error) {
    console.warn("⚠️ Database connection failed. Backend will run without database.");
    console.warn("Error:", (error as Error).message);
  }

  const server = app.listen(port, host, () => {
    console.log(`✅ Backend running on port ${port}`);
    console.log(`📱 Production API Ready at ${process.env.VITE_API_BASE_URL || `http://${host}:${port}`}`);
  });

  // Initialize cron jobs for daily reset (Mereset otomatis saat pergantian hari/tengah malam)
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