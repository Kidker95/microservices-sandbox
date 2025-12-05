import { Currency, OrderStatus } from "./enums";

export type Address = {
    fullName: string;
    street: string;
    country: string;
    zipCode: string;
    phone?: string
}

export type OrderItem = {
    productId: string;
    sku?: string;
    name: string;
    size?: string;
    color?: string;
    quantity: number;
    unitPrice: number;
    currency: Currency;
}


export type Order = {
    _id: string;
    userId: string;
    items: OrderItem[];
    status: OrderStatus;
    subtotal: number;
    shippingCost: number;
    total: number;
    shippingAddress: Address;
    createdAt: Date;
    updatedAt: Date;
}

export type RemoteUser = {
    _id: string,
    email:string,
    name:string,
    address: Address,
    role:string
}