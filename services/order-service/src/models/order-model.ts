import mongoose, { Model, Schema, Document } from "mongoose";
import { Address, Order, OrderItem } from "./types";
import { Currency, OrderStatus } from "./enums";

export interface OrderDocument extends Omit<Order, "_id">, Document {}

const validator = (_id:string): boolean =>mongoose.isValidObjectId(_id);


const AddressSchema = new Schema<Address>({
    fullName:  { type: String, required: [true, "Missing fullName"], trim: true },
    street:    { type: String, required: [true, "Missing street"],   trim: true },
    country:   { type: String, required: [true, "Missing country"],  trim: true },
    zipCode:   { type: String, required: [true, "Missing zip code"], trim: true },
    phone:     { type: String, trim: true },
}, { _id: false });

const OrderItemSchema = new Schema<OrderItem>({
    productId:  { type: String, required: [true, "Missing productId"], trim: true },
    sku:        { type: String, trim: true },
    name:       { type: String, required: [true, "Missing product name"], trim: true },
    size:       { type: String, trim: true },
    color:      { type: String, trim: true },
    quantity:   { type: Number, required: [true, "Missing quantity"], min: [1, "Quantity must be at least 1"] },
    unitPrice:  { type: Number, required: [true, "Missing unit price"], min: [0, "Unit price cannot be negative"] },
    currency:   { type: String, enum: Object.values(Currency), required: [true, "Missing currency"] }
}, { _id: false });

const OrderSchema = new Schema<OrderDocument>({
    userId: {
        type: String,
        required: [true, "Missing userId"],
        trim: true,
        validate: validator,
        message: "userId must be a valid Mongo ObjectId"
    },
    items: {
        type: [OrderItemSchema],
        required: [true, "Order must contain at least one item"],
        validate: {
            validator: (items: OrderItem[]) => items && items.length > 0,
            message: "Order must contain at least one item"
        }
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Pending
    },
    subtotal: {
        type: Number,
        required: [true, "Missing subtotal"],
        min: [0, "Subtotal cannot be negative"]
    },
    shippingCost: {
        type: Number,
        required: [true, "Missing shipping cost"],
        min: [0, "Shipping cost cannot be negative"]
    },
    total: {
        type: Number,
        required: [true, "Missing total"],
        min: [0, "Total cannot be negative"]
    },
    shippingAddress: {
        type: AddressSchema,
        required: [true, "Missing shipping address"]
    }
}, { timestamps: true });

export const OrderModel: Model<OrderDocument> =
    mongoose.model<OrderDocument>("Order", OrderSchema);
