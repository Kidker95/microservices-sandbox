import dotenv from "dotenv";
dotenv.config({ quiet: true });

class Env {
    public readonly port: number = Number(process.env.PORT) || 4003;
    public readonly environment: string = process.env.NODE_ENV || "development";
    public readonly mongoConnectionString: string;

    public constructor() {
        const conn = process.env.MONGO_CONNECTION_STRING;
        if (!conn) throw new Error("MONGO_CONNECTION_STRING is not defined (product-service)");
        this.mongoConnectionString = conn;

    }
}

export const env = new Env();