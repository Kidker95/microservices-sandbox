import { Currency } from "../enums";

export type RemoteProduct = {
    _id: string;
    sku: string;
    name: string;
    price: number;
    currency: Currency;
    stock: number;
    isActive: boolean;
    
}