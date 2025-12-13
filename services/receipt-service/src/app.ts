import express, { Express, Request, Response } from "express";
import { errorMiddleware } from "./middleware/error-middleware";
import receiptRouter from "./routes/receipt-routes";
import { env } from "./config/env";


export class App {
    public readonly server: Express;

    constructor() {
        this.server = express();
        this.registerInfra();
        this.registerRoutes();
        this.registerErrorHandling();

    }

    private registerInfra(): void {
        this.server.use(express.json());
    }

    private registerRoutes(): void {
        this.server.get("/health", (req: Request, res: Response) => {
            res.json({ status: "ok", service: "receipt-service" });
        });
        this.server.use("/api/receipts", receiptRouter);
    }

    private registerErrorHandling(): void {
        this.server.use(errorMiddleware.routeNotFound);
        this.server.use(errorMiddleware.catchAll);
    }

    public start() {
        this.server.listen(env.port, () => {
            console.log(`Receipt service running on port ${env.port}`);
        })
    }
}

export const app = new App();

const bootstrap = async (): Promise<void> => app.start();
bootstrap();
