import { createServiceApp } from "@ms/common/app";
import { env } from "./config/env";
import receiptRouter from "./routes/receipt-routes";
import { pdfBrowser } from "./utils/pdf-browser";

const { start } = createServiceApp({
    serviceName: "receipt-service",
    port: env.port,
    basePath: "/api/receipts",
    router: receiptRouter,
});

const registerShutdown = (): void => {
    const shutdown = async () => {
        try { await pdfBrowser.close(); }
        finally { process.exit(0); }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
};

registerShutdown();
start();
