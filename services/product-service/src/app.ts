import express, { Express, Request, Response } from "express";
import { errorMiddleware } from "./middleware/error-middleware";
import { env } from "./config/env";
import { dal } from "./dal";
import { productRouter } from "./routes/product-routes";

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
            res.json({ status: "ok", service: "product-service" });
        });
        this.server.use("/api/products", productRouter);
    }

    private registerErrorHandling(): void {
        this.server.use(errorMiddleware.routeNotFound);
        this.server.use(errorMiddleware.catchAll);
    }

    public start(){
        this.server.listen(env.port, ()=>{
            console.log(`Product service running on port ${env.port}`);
        })
    }
}

export const app = new App();

const bootstrap = async (): Promise<void> => {
    await dal.connect();
    app.start();
}
bootstrap();

