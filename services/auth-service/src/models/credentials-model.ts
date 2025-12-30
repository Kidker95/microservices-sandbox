import mongoose, { Document, Model, Schema } from "mongoose";
import { Credentials } from "./types";

export interface CredentialsDocument
    extends Omit<Credentials, "_id">, Document { }

const CredentialsSchema = new Schema<CredentialsDocument>(
    {
        email: {
            type: String,
            required: [true, "Missing email"],
            unique: true,
            trim: true,
            lowercase: true
        },
        passwordHash: {
            type: String,
            required: [true, "Missing password hash"]
        },
        userId: {
            type: String,
            required: [true, "Missing userId"],
            index: true
        }
    },
    { timestamps: true }
);

export const CredentialsModel: Model<CredentialsDocument> =
    mongoose.model<CredentialsDocument>("Credentials", CredentialsSchema);