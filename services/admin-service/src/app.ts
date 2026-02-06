import { createServiceApp } from '@ms/common/app';
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error-middleware";
import adminRouter from "./routes/admin-routes";

const { start } = createServiceApp({
    serviceName: "admin-service",
    port: env.port,
    basePath: "/api/admin",
    router: adminRouter,
    enableCookies: true,
    error: {
        routeNotFound: errorMiddleware.routeNotFound,
        catchAll: errorMiddleware.catchAll
    }
});

start();