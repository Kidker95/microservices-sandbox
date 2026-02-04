import dotenv from "dotenv";
import { envHelpers } from "@ms/common/config";
dotenv.config({ quiet: true });

class Env {
    
   public readonly port: number = envHelpers.getNumberEnv("PORT", 4004)!;
    public readonly environment: string = envHelpers.getEnv("NODE_ENV", "development")!;

   public readonly userServiceBaseUrl: string = envHelpers.requireUrlEnv("USER_SERVICE_BASE_URL");
   public readonly orderServiceBaseUrl: string = envHelpers.requireUrlEnv("ORDER_SERVICE_BASE_URL");
   public readonly productServiceBaseUrl: string = envHelpers.requireUrlEnv("PRODUCT_SERVICE_BASE_URL");
   public readonly fortuneServiceBaseUrl: string = envHelpers.requireUrlEnv("FORTUNE_SERVICE_BASE_URL");
   public readonly authServiceBaseUrl: string = envHelpers.requireUrlEnv("AUTH_SERVICE_BASE_URL");
}

export const env = new Env();