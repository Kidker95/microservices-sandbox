import dotenv from "dotenv";
dotenv.config({ quiet: true });

class Env {
    public readonly port: number = Number(process.env.PORT) || 4001;
    public readonly environment: string = process.env.NODE_ENV || "development";
    public readonly seedRootAdminEmail: string = process.env.SEED_ROOT_ADMIN_EMAIL || "seed-root-admin@sandbox.com";

    public readonly mongoConnectionString: string;

    public readonly authServiceBaseUrl: string = process.env.AUTH_SERVICE_BASE_URL || "http://localhost:4007"


    public constructor() {
        const conn = process.env.MONGO_CONNECTION_STRING;
        if (!conn) throw new Error("MONGO_CONNECTION_STRING is not defined (user-service)");
        this.mongoConnectionString = conn;
    }
}

export const env = new Env();
