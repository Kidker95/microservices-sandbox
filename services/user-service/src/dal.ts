import mongoose from "mongoose";

import { env } from "./config/env";

class DAL {
    public async connect(): Promise<void> {
        try {
            await mongoose.connect(env.mongoConnectionString);
            console.log("Connected to MongoDB (user-service)");
        } catch (err) {
            console.error("Failed to connect to MongoDB (user-service) ", err);
            process.exit(1);
        }

    }
}

export const dal = new DAL();