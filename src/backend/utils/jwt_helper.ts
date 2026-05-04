import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || '123';

export type AuthTokenPayload = {
  userId: string;
  username?: string;
  role?: string;
  purpose?: 'auth' | 'attendance_qr';
};

// Generate a JWT token
export const generateToken = (
  payload: AuthTokenPayload,
  expiresIn: jwt.SignOptions['expiresIn'] = '30d'
): string => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

export const generateAttendanceQrToken = (userId: string): string => {
  return generateToken({ userId, purpose: 'attendance_qr' }, '15m');
};

// Verify a JWT token
export const verifyToken = (token: string): AuthTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as AuthTokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
};
