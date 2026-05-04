import { user as User } from "../../../models/user";
import QRCode from "qrcode";
import crypto from "crypto";

/**
 * Generate unique QR code untuk user (1 per hari)
 * QR berisi: user_id + timestamp + random hash
 */
export const generateUserQrCode = async (userId: string): Promise<string> => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const randomHash = crypto.randomBytes(8).toString("hex");
  const qrData = `USER_${userId}_${today}_${randomHash}`;
  return qrData;
};

/**
 * Generate QR image (DataURL) dari QR data
 */
export const generateQrImage = async (qrData: string): Promise<string> => {
  return await QRCode.toDataURL(qrData);
};

/**
 * Check apakah device sudah login untuk user lain hari ini
 * Return: { isLocked: boolean, lockedUserId?: string, lockedUsername?: string }
 */
export const checkDeviceLock = async (
  deviceId: string,
  currentUserId: string
): Promise<{ isLocked: boolean; lockedUserId?: string; lockedUsername?: string }> => {
  if (!deviceId) {
    return { isLocked: false }; // Device ID tidak dikirim = tidak ada lock
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Cari user lain yang login hari ini dengan device ini
  const lockedUser = await User.findOne({
    where: {
      device_id: deviceId,
      device_login_date: today,
    },
  });

  if (!lockedUser || lockedUser.user_id === currentUserId) {
    return { isLocked: false };
  }

  return {
    isLocked: true,
    lockedUserId: lockedUser.user_id,
    lockedUsername: lockedUser.name,
  };
};

/**
 * Save QR & device info ke user record
 */
export const saveUserQrAndDevice = async (
  userId: string,
  qrCode: string,
  deviceId: string | null
): Promise<User> => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const tomorrowAtMidnight = new Date();
  tomorrowAtMidnight.setDate(tomorrowAtMidnight.getDate() + 1);
  tomorrowAtMidnight.setHours(0, 0, 0, 0);

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await user.update({
    qr_code: qrCode,
    qr_expires_at: tomorrowAtMidnight,
    device_id: deviceId || null,
    device_login_date: today,
    last_login_at: new Date(),
  });

  return user;
};

/**
 * Reset QR & device untuk semua user (jalankan di 00:00)
 * Dipanggil oleh cron job setiap tengah malam
 */
export const resetDailyQrAndDevice = async (): Promise<number> => {
  const today = new Date().toISOString().split("T")[0];

  // Reset QR jika sudah kadaluarsa
  const [affectedCount] = await User.sequelize!.query(
    `UPDATE users 
     SET qr_code = NULL, device_login_date = NULL 
     WHERE qr_expires_at <= NOW()`
  );

  console.log(`[Daily Reset] Reset QR & device lock untuk ${affectedCount} users`);
  return affectedCount as unknown as number;
};

/**
 * Verify QR code (cek apakah QR valid dan belum expired)
 */
export const verifyUserQrCode = async (
  userId: string,
  qrCode: string
): Promise<{ isValid: boolean; message: string }> => {
  const user = await User.findByPk(userId);
  if (!user) {
    return { isValid: false, message: "User not found" };
  }

  if (!user.qr_code) {
    return { isValid: false, message: "QR code not generated for this user" };
  }

  if (user.qr_code !== qrCode) {
    return { isValid: false, message: "QR code mismatch" };
  }

  if (user.qr_expires_at && new Date() > user.qr_expires_at) {
    return { isValid: false, message: "QR code expired" };
  }

  return { isValid: true, message: "QR code valid" };
};
