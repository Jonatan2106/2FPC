import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncController = (req: Request, res: Response, next?: NextFunction) => Promise<unknown>;

export const controllerWrapper = (controller: AsyncController): RequestHandler => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
};
