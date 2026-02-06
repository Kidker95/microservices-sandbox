import { createServiceApp } from "@ms/common/app";
import { env } from "./config/env";
import { authRouter } from "./routes/auth-routes";

const { app } = createServiceApp({
    serviceName: "auth-service",
    port: env.port,
    basePath: "/api/auth",
    router: authRouter,
});

export { app };
