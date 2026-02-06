import cookieParser from "cookie-parser";
import type { RequestHandler, ErrorRequestHandler, Router } from "express";
import express, { Express, Request, Response } from "express";
import { errorMiddleware as commonErrorMiddleware } from "../middleware/error-middleware";

type CreateServiceAppOptions = {
    // basic info
    serviceName: string;
    port: number;
    basePath: string;
    router: Router;

    enableCookies?: boolean; //only for admin-service for now, but can be useful for other services in the future
    healthPath?: string; // default "/health"

    beforeRoutes?: RequestHandler[];
    afterRoutes?: RequestHandler[];

    error?: {
        routeNotFound: RequestHandler;
        catchAll: ErrorRequestHandler;
    };
};

export const createServiceApp = (options: CreateServiceAppOptions) => {

    const {
        serviceName,
        port,
        basePath,
        router,
        enableCookies = false,
        healthPath = "/health",
        beforeRoutes = [],
        afterRoutes = [],
    } = options;

    const routeNotFound = options.error?.routeNotFound ?? commonErrorMiddleware.routeNotFound;
    const catchAll = options.error?.catchAll ?? commonErrorMiddleware.catchAll;

    const app: Express = express();

    // Infra
    app.use(express.json());
    if (enableCookies) app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));

    // Custom middleware hooks
    for (const mw of beforeRoutes) app.use(mw);

    // Health
    app.get(healthPath, (_req: Request, res: Response) => {
        res.json({ status: "ok", service: serviceName, uptimeSeconds: Math.floor(process.uptime()) });
    });

    // Routes
    app.use(basePath, router);

    // Custom middleware hooks
    for (const mw of afterRoutes) app.use(mw);

    // Error handling (must be last)
    app.use(routeNotFound);
    app.use(catchAll);

    const start = (): void => {
        app.listen(port, () => console.log(`${serviceName} running on port ${port}`));
    };

    return { app, start };
};