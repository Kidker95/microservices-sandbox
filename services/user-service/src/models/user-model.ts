import mongoose, { Model, Schema, Document } from "mongoose";
import { Address, User } from "./types";
import { UserRole } from "./enums";

export interface UserDocument extends Omit<User, "_id">, Document {}

const AddressSchema = new Schema<Address>({
    fullName: { type: String, required: [true, "Missing fullName"], trim: true },
    street: { type: String, required: [true, "Missing street"], trim: true },
    country: { type: String, required: [true, "Missing country"], trim: true },
    zipCode: { type: String, required: [true, "Missing zip code"], trim: true },
    phone: { type: String, trim: true },
}, { _id: false });

const UserSchema = new Schema<UserDocument>({
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.User },
    address: { type: AddressSchema, required: true }
}, { timestamps: true });

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", UserSchema);
