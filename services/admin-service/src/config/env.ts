import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { envHelpers } from "@ms/common/config";


class Env {
    public readonly port: number = envHelpers.getNumberEnv("PORT", 4005)!;
    public readonly environment: string = envHelpers.getEnv("NODE_ENV", "development")!;
    public readonly userServiceBaseUrl: string = envHelpers.requireUrlEnv("USER_SERVICE_BASE_URL");
    public readonly orderServiceBaseUrl: string = envHelpers.requireUrlEnv("ORDER_SERVICE_BASE_URL");
    public readonly productServiceBaseUrl: string = envHelpers.requireUrlEnv("PRODUCT_SERVICE_BASE_URL");
    public readonly receiptServiceBaseUrl: string = envHelpers.requireUrlEnv("RECEIPT_SERVICE_BASE_URL");
    public readonly fortuneServiceBaseUrl: string = envHelpers.requireUrlEnv("FORTUNE_SERVICE_BASE_URL");
    public readonly authServiceBaseUrl: string = envHelpers.requireUrlEnv("AUTH_SERVICE_BASE_URL");
    public readonly nginxHealthUrl: string = envHelpers.requireUrlEnv("NGINX_HEALTH_URL");
    public readonly gatewayBaseUrl: string = envHelpers.getEnv("GATEWAY_BASE_URL", "http://localhost:8080")!;
}

export const env = new Env();
