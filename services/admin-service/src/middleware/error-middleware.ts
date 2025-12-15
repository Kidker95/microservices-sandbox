import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../models/enums";


class ErrorMiddleware {

    public catchAll(err: any, req: Request, res: Response, next: NextFunction): void {
        console.error(err);


        const status: number = err?.status || StatusCode.InternalServerError;
        const message: string = err?.message || `Internal Server Error`;

        res.status(status).json({ error: message });
    }

    public routeNotFound(req: Request, res: Response, next: NextFunction): void {
        res.status(StatusCode.NotFound).json({ error: `Route ${req.originalUrl} not found` });
    }
}

export const errorMiddleware = new ErrorMiddleware();