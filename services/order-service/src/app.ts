import express, { Express, Request, Response } from "express";
import { env } from "./config/env";
import { ordersRouter } from "./routes/orders-routes";
import { errorMiddleware } from "@ms/common/middleware";
import { dal } from "./dal";


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
            res.json({ status: "ok", service: "order-service", uptimeSeconds: Math.floor(process.uptime()) });
        });
        this.server.use("/api/orders", ordersRouter);


    }

    private registerErrorHandling(): void {
        this.server.use(errorMiddleware.routeNotFound);
        this.server.use(errorMiddleware.catchAll);
    }

    public start() {
        this.server.listen(env.port, () => {
            console.log(`Order Service running on port ${env.port}`);
        })
    }
}

async function bootstrap(): Promise<void>{
    await dal.connect();
    app.start();
}


export const app = new App();
bootstrap();