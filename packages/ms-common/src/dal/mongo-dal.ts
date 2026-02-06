import mongoose from "mongoose";
import { ServiceUnavailableError } from "../errors";

type CreateMongoDalOptions = {
    serviceName: string;
    mongoUri: string;
};

export const createMongoDal = (options: CreateMongoDalOptions) => {

    const { serviceName, mongoUri } = options;

    const connect = async (): Promise<void> => {
        try {
            await mongoose.connect(mongoUri);
            console.log(`Connected to MongoDB (${serviceName})`);
        } catch (err: any) {
            console.error(`Failed connecting to MongoDB (${serviceName})`, err);
            throw new ServiceUnavailableError(`MongoDB connection failed (${serviceName})`);
        }
    };

    const disconnect = async (): Promise<void> => await mongoose.disconnect();


    return { connect, disconnect };
};
