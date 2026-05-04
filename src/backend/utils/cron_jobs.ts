import cron from "node-cron";
import { resetDailyQrAndDevice } from "./qr_device_helper";

/**
 * Initialize cron jobs for daily reset
 * - Reset QR codes & device locks at 00:00 (midnight)
 */
export const initializeCronJobs = () => {
  // Run at 00:00 every day (midnight)
  const dailyResetJob = cron.schedule("0 0 * * *", async () => {
    console.log("[Cron Job] Running daily QR & device lock reset...");
    try {
      const resetCount = await resetDailyQrAndDevice();
      console.log(`[Cron Job] Successfully reset ${resetCount} user records`);
    } catch (error) {
      console.error("[Cron Job] Failed to reset daily QR & device lock:", error);
    }
  });

  // Test job - run at startup to verify cron is working
  console.log("[Cron Jobs] Initialized:");
  console.log("  - Daily reset at 00:00 (UTC)");

  return dailyResetJob;
};
