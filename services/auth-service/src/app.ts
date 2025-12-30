import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { env } from "./config/env";
import { dal } from "./dal";
import { errorMiddleware } from "./middleware/error-middleware";
import { authRouter } from "./routes/auth-routes";


dotenv.config({ quiet: true });

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
            res.json({ status: "ok", service: "auth-service", uptimeSeconds: Math.floor(process.uptime()) });
        });
        this.server.use("/api/auth", authRouter);
        // this.server.use("/api/users", usersRouter);
    }

    private registerErrorHandling(): void {
        this.server.use(errorMiddleware.routeNotFound);
        this.server.use(errorMiddleware.catchAll);
    }

    public start() {
        this.server.listen(env.port, () => {
            console.log(`Auth service is running on port ${env.port}`);
        })
    }

    
}

async function bootstrap(): Promise<void> {
    await dal.connect();
    app.start();


}

export const app = new App();
bootstrap();


