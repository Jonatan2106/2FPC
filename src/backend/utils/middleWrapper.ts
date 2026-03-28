import type { NextFunction, Request, Response } from "express";

type ExpressRouteHandler<T> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T> | T;

export function middlewareWrapper<T>(
  handler: ExpressRouteHandler<T>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
      next();
    } catch (error) {
      next(error);
    }
  };
}