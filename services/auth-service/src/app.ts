import { createServiceApp } from "@ms/common/app";
import { createMongoDal } from "@ms/common/dal";
import { env } from "./config/env";
import { authRouter } from "./routes/auth-routes";

export const dal = createMongoDal({
    serviceName: "auth-service",
    mongoUri: env.mongoConnectionString,
});

const { start } = createServiceApp({
    serviceName: "auth-service",
    port: env.port,
    basePath: "/api/auth",
    router: authRouter,
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
