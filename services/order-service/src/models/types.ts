import { Currency, OrderStatus, Size } from "@ms/common/enums";
import { Address } from "@ms/common/types";

export type OrderItem = {
    productId: string;
    sku?: string;
    name: string;
    size?: Size;
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

export type CreateOrderItemDto = {
    productId: string;
    quantity: number;
    size?: Size;
    color?: string;
};

export type CreateOrderDto = {
    userId: string;
    items: CreateOrderItemDto[];
    shippingAddress: Address;
};