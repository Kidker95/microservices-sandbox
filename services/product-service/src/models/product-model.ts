import mongoose, { Model, Schema, Document } from "mongoose";
import { Product } from "./types";
import { Currency, Size } from "./enums";

export interface ProductDocument extends Omit<Product, "_id">, Document {}

const ProductSchema = new Schema<ProductDocument>({
    sku: {
        type: String,
        required: [true, "Missing sku"],
        trim: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, "Missing product name"],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Missing price"],
        min: [0, "Price cannot be negative"]
    },
    currency: {
        type: String,
        enum: Object.values(Currency),
        required: [true, "Missing currency"]
    },
    stock: {
        type: Number,
        required: [true, "Missing stock"],
        min: [0, "Stock cannot be negative"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sizes: {
        type: [String],
        enum: Object.values(Size),
        default: []
    },
    colors: {
        type: [String],
        default: []
    }
}, { timestamps: true });

export const ProductModel: Model<ProductDocument> =
    mongoose.model<ProductDocument>("Product", ProductSchema);
