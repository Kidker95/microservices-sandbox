import { createServiceApp } from "@ms/common/app";
import { env } from "./config/env";
import { usersRouter } from "./routes/users-routes";

const { app } = createServiceApp({
    serviceName: "user-service",
    port: env.port,
    basePath: "/api/users",
    router: usersRouter,
});

export { app };
