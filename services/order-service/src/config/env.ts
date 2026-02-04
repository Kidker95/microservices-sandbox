import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { envHelpers } from "@ms/common/config";


class Env {
    public readonly port: number = envHelpers.getNumberEnv("PORT", 4002)!;
    public readonly environment: string = envHelpers.getEnv("NODE_ENV", "development")!;
    public readonly userServiceBaseUrl: string = envHelpers.requireUrlEnv("USER_SERVICE_BASE_URL");
    public readonly productServiceBaseUrl: string = envHelpers.requireUrlEnv("PRODUCT_SERVICE_BASE_URL");
    public readonly authServiceBaseUrl: string = envHelpers.requireUrlEnv("AUTH_SERVICE_BASE_URL");
    public readonly mongoConnectionString: string= envHelpers.requireEnv("MONGO_CONNECTION_STRING");
}


export const env = new Env();
