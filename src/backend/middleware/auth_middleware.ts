import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt_helper";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Attach user context in headers so controllers can read it without custom Request typing.
  req.headers["x-user-id"] = payload.userId;
  if (payload.role) {
    req.headers["x-user-role"] = payload.role;
  }

  return next();
};
