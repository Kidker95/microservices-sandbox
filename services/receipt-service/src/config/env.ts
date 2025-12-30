import dotenv from "dotenv";
dotenv.config({ quiet: true });

class Env {
   public readonly port: number = Number(process.env.PORT) || 4004;

   public readonly environment: string = process.env.NODE_ENV || "development";

   public readonly userServiceBaseUrl: string = process.env.USER_SERVICE_BASE_URL || "http://localhost:4001/api"
   public readonly orderServiceBaseUrl: string = process.env.ORDER_SERVICE_BASE_URL || "http://localhost:4002/api"
   public readonly productServiceBaseUrl: string = process.env.PRODUCT_SERVICE_BASE_URL || "http://localhost:4003/api"
   public readonly fortuneServiceBaseUrl: string = process.env.FORTUNE_SERVICE_BASE_URL || "http://localhost:4006/api"
   public readonly authServiceBaseUrl: string = process.env.AUTH_SERVICE_BASE_URL || "http://localhost:4007/api"
}

export const env = new Env();