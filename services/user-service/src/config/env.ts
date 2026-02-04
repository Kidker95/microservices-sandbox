import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { envHelpers } from "@ms/common/config";


class Env {
    public readonly port: number = envHelpers.getNumberEnv("PORT", 4001)!;
    public readonly environment: string = envHelpers.getEnv("NODE_ENV", "development")!;
    public readonly mongoConnectionString: string = envHelpers.requireEnv("MONGO_CONNECTION_STRING");
    public readonly seedRootAdminEmail: string = envHelpers.requireEnv("SEED_ROOT_ADMIN_EMAIL");
   public readonly authServiceBaseUrl: string = envHelpers.requireUrlEnv("AUTH_SERVICE_BASE_URL");
}

export const env = new Env();
