import { env } from "./config/env";
import mongoose from "mongoose";

class DAL {
    public async connect(): Promise<void> {
        try {
            await mongoose.connect(env.mongoConnectionString);
            console.log("Connected to MongoDB (product-service)");
        } catch (err) {
            console.error("Failed to connect to MongoDB (product-service)");
            process.exit(1);
        }
    }

}

export const dal = new DAL();