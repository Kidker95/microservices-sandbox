import dotenv from "dotenv";
dotenv.config({ quiet: true });

class Env {
    public readonly port: number = Number(process.env.PORT) || 4007;
    public readonly environment: string = process.env.NODE_ENV || "development";
    public readonly seedRootAdminEmail: string = process.env.SEED_ROOT_ADMIN_EMAIL || "seed-root-admin@sandbox.com";

    public readonly hashingSalt: string = process.env.HASHING_SALT || "tLaSgNiHsAh";
    public readonly passwordPepper: string = process.env.PASSWORD_PEPPER || "rEpPePdRoWsSaP";
    public readonly jwtSecret: string = process.env.JWT_SECRET || "tErCeStwJ";

    public readonly bcryptSaltRounds: number = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

    public readonly userServiceBaseUrl: string = process.env.USER_SERVICE_BASE_URL || "http://localhost:4001";



    public readonly mongoConnectionString: string;

    public constructor(){
        const conn = process.env.MONGO_CONNECTION_STRING;
        if(!conn) throw new Error("MONGO_CONNECTION_STRING is not defined (user-service)");
        this.mongoConnectionString = conn;
    }
}

export const env = new Env();
