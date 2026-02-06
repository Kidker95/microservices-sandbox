import { createServiceApp } from "@ms/common/app";
import { createMongoDal } from "@ms/common/dal";
import { env } from "./config/env";
import { usersRouter } from "./routes/users-routes";

export const dal = createMongoDal({
    serviceName: "user-service",
    mongoUri: env.mongoConnectionString,
});

const { start } = createServiceApp({
    serviceName: "user-service",
    port: env.port,
    basePath: "/api/users",
    router: usersRouter,
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