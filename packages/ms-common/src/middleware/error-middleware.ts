import { Request, Response, NextFunction } from "express";
import { ClientError } from "../errors";
import { StatusCode } from "../enums";

function routeNotFound(req: Request, res: Response): void {
    res.status(StatusCode.NotFound).json({ error: `Route ${req.originalUrl} not found` });
}

function catchAll(err: unknown, req: Request, res: Response, next: NextFunction): void {

    if (err instanceof ClientError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    console.error("[Unhandled Error]", err);

    res.status(StatusCode.InternalServerError).json({ error: "Internal server error" });
}

export const errorMiddleware = { routeNotFound, catchAll };
