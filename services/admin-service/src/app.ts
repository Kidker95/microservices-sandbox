import express, { Express, Request, Response } from "express";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error-middleware";
import adminRouter from "./routes/admin-routes"


export class App{
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
            res.json({ status: "ok", service: "admin-service" });
        });
        this.server.use("/api/admin", adminRouter);
    }

    private registerErrorHandling(): void {
        this.server.use(errorMiddleware.routeNotFound);
        this.server.use(errorMiddleware.catchAll);
    }

    public start() {
        
        this.server.listen(env.port, () => {
            console.log(`Admin service running on port ${env.port}`);
        });
    }
}

export const app = new App();

const bootstrap = async (): Promise<void> => app.start();
bootstrap();
