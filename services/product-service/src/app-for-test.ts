import { createServiceApp } from "@ms/common/app";
import { env } from "./config/env";
import { productRouter } from "./routes/product-routes";

const { app } = createServiceApp({
    serviceName: "product-service",
    port: env.port,
    basePath: "/api/products",
    router: productRouter,
});

export { app };
