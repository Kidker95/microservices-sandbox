import { createServiceApp } from "@ms/common/app";
import { createMongoDal } from "@ms/common/dal";
import { env } from "./config/env";
import { productRouter } from "./routes/product-routes";

export const dal = createMongoDal({
    serviceName: "product-service",
    mongoUri: env.mongoConnectionString,
});

const { start } = createServiceApp({
    serviceName: "product-service",
    port: env.port,
    basePath: "/api/products",
    router: productRouter,
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