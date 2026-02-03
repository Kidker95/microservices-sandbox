import { NextFunction, Request, Response } from "express";
import { StatusCode } from "@ms/common/enums";


class ErrorMiddleware {

    public catchAll(err: any, req: Request, res: Response, next: NextFunction) {
        console.error(err);


        const status: number = err?.status || StatusCode.InternalServerError;
        const payload: any = { error: err?.message || `Internal Server Error` };

        if (err?.service) payload.service = err.service;
        if (err?.dependency) payload.dependency = err.dependency;
        if (err?.details) payload.details = err.details;


        const expectsHtml = (req.accepts(["html", "json"]) === "html") || req.headers.accept?.includes("text/html");

        // Browser UX: redirect unauthenticated dashboard requests to /api/admin/login.
        if (expectsHtml &&
            status === StatusCode.Unauthorized &&
            req.originalUrl.startsWith("/api/admin") &&
            !req.originalUrl.startsWith("/api/admin/login")) { return res.redirect(`/api/admin/login`); }
        res.status(status).json(payload);
    }

    public routeNotFound(req: Request, res: Response, next: NextFunction): void {
        const expectsHtml = (req.accepts(["html", "json"]) === "html") || req.headers.accept?.includes("text/html");

        if (expectsHtml && req.originalUrl.startsWith("/api/admin")) return res.redirect("/api/admin/login");


        res.status(StatusCode.NotFound).json({ error: `Route ${req.originalUrl} not found` });
    }
}

export const errorMiddleware = new ErrorMiddleware();