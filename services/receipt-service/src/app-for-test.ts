import { createServiceApp } from "@ms/common/app";
import { env } from "./config/env";
import receiptRouter from "./routes/receipt-routes";

const { app } = createServiceApp({
    serviceName: "receipt-service",
    port: env.port,
    basePath: "/api/receipts",
    router: receiptRouter,
});

export { app };
