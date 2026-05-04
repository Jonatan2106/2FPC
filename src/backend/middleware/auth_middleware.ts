import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt_helper";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log('[authenticateJWT] Auth header present:', !!authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('[authenticateJWT] Missing or invalid Bearer token');
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7).trim();
  const payload = verifyToken(token);
  console.log('[authenticateJWT] Token valid:', !!payload, 'userId:', payload?.userId);
  
  if (!payload) {
    console.log('[authenticateJWT] Token verification failed');
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Attach user context in headers so controllers can read it without custom Request typing.
  req.headers["x-user-id"] = payload.userId;
  if (payload.role) {
    req.headers["x-user-role"] = payload.role;
  }

  return next();
};
