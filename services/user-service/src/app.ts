import express, { Express, Request, Response } from "express";
import { usersRouter } from "./routes/users-routes";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error-middleware";
import { dal } from "./dal";
import { authRouter } from "./routes/auth-routes";


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
            res.json({ status: "ok", service: "user-service" });
        });
        this.server.use("/api/auth", authRouter);
        this.server.use("/api/users", usersRouter);
    }

    private registerErrorHandling(): void {
        this.server.use(errorMiddleware.routeNotFound);
        this.server.use(errorMiddleware.catchAll);
    }
    

    public start() {
        this.server.listen(env.port, () => {
            console.log(`User Service running on port ${env.port}`);
        })
    }
}

async function bootstrap(): Promise<void> {
    await dal.connect();
    app.start();
}

export const app = new App();
bootstrap();