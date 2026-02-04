import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { envHelpers } from "@ms/common/config";

class Env {
    public readonly port: number = envHelpers.getNumberEnv("PORT", 4007)!;
    public readonly environment: string = envHelpers.getEnv("NODE_ENV", "development")!;
    public readonly mongoConnectionString: string= envHelpers.requireEnv("MONGO_CONNECTION_STRING");
    
    public readonly seedRootAdminEmail: string = envHelpers.requireEnv("SEED_ROOT_ADMIN_EMAIL");

    public readonly hashingSalt: string = envHelpers.requireEnv("HASHING_SALT");
    public readonly passwordPepper: string = envHelpers.requireEnv("PASSWORD_PEPPER");
    public readonly jwtSecret: string = envHelpers.requireEnv("JWT_SECRET");
    public readonly bcryptSaltRounds: number = envHelpers.getNumberEnv("BCRYPT_SALT_ROUNDS", 10)!;

    public readonly userServiceBaseUrl: string = envHelpers.requireUrlEnv("USER_SERVICE_BASE_URL");

}

export const env = new Env();
