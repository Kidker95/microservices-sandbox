import { createServiceApp } from "@ms/common/app";
import { env } from "./config/env";
import { ordersRouter } from "./routes/orders-routes";

const { app } = createServiceApp({
    serviceName: "order-service",
    port: env.port,
    basePath: "/api/orders",
    router: ordersRouter,
});

export { app };
