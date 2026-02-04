import { Currency, Size } from "@ms/common";

export interface Product {
    _id: string;
    sku: string;
    name: string;
    description?: string;
    price: number;
    currency: Currency;
    stock: number;
    isActive: boolean;
    sizes?: Size[];
    colors?: string[];
    createdAt: Date;
    updatedAt: Date;
}

