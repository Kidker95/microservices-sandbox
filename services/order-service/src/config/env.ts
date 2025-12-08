import dotenv from "dotenv";
dotenv.config({ quiet: true });

class Env {
    public readonly port: number = Number(process.env.PORT) || 4002;
    public readonly environment: string = process.env.NODE_ENV || "development";
    public readonly userServiceBaseUrl: string = process.env.USER_SERVICE_URL || "http://localhost:4001/api";
    public readonly productServiceBaseUrl: string = process.env.PRODUCT_SERVICE_URL || "http://localhost:4003/api";
    public readonly mongoConnectionString: string;

    public constructor(){
        const conn = process.env.MONGO_CONNECTION_STRING;
        if(!conn) throw new Error("MONGO_CONNECTION_STRING is not defined (order-service)");
        this.mongoConnectionString = conn;
    }

}


export const env = new Env();
