import { createServiceApp } from "@ms/common/app";
import { env } from "./config/env";
import { fortuneRouter } from "./routes/fortune-routes";

const { app } = createServiceApp({
    serviceName: "fortune-service",
    port: env.port,
    basePath: "/api/fortune",
    router: fortuneRouter,
});

export { app };
