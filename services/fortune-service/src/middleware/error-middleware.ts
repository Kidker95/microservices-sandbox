import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../models/enums";


class ErrorMiddleware {

  public catchAll(err: any, req: Request, res: Response, next: NextFunction): void {
        console.error(err);

        const status: number = err?.status || StatusCode.InternalServerError;
        const payload: any = { error: err?.message || `Internal Server Error` };

        if (err?.service) payload.service = err.service;
        if (err?.dependency) payload.dependency = err.dependency;
        if (err?.details) payload.details = err.details;


        res.status(status).json(payload);
    }

    public routeNotFound(req: Request, res: Response, next: NextFunction): void {
        res.status(StatusCode.NotFound).json({ error: `Route ${req.originalUrl} not found` });
    }
}

export const errorMiddleware = new ErrorMiddleware();