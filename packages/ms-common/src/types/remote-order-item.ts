import { Currency } from "../enums";

export type RemoteOrderItem = {
    productId: string;
    sku?: string;
    name: string;
    size?: string;      
    color?: string;
    quantity: number;
    unitPrice: number;
    currency: Currency;  
};