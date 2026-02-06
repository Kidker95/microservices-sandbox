import { createServiceApp } from "@ms/common/app";
import { createMongoDal } from "@ms/common/dal";
import { env } from "./config/env";
import { ordersRouter } from "./routes/orders-routes";

export const dal = createMongoDal({
    serviceName: "order-service",
    mongoUri: env.mongoConnectionString,
});

const { start } = createServiceApp({
    serviceName: "order-service",
    port: env.port,
    basePath: "/api/orders",
    router: ordersRouter,
});

const bootstrap = async (): Promise<void> => {
    await dal.connect();

    const shutdown = async () => {
        try { await dal.disconnect?.(); }
        finally { process.exit(0); }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    start();
};

bootstrap();