import { Fortune, RemoteAddress, RemoteOrder, RemoteProduct, RemoteUser } from "@ms/common";

// =-=-=-=-=-=-=-=-= R E C E I P T   I N T E R N A L   T Y P E S =-=-=-=-=-=-=-=-=
// These are internal "view models" used by gatherResources() and the
// HTML / PDF generators.

// A single line on the receipt
export type ReceiptItem = {
    name: string;
    sku?: string;
    size?: string;
    color?: string;
    quantity: number;
    unitPrice: number;
    currency: string;
    lineTotal: number;
};

// Customer section on the receipt
export type ReceiptCustomer = {
    name: string;
    email: string;
    address: RemoteAddress;
};

// High-level order summary information used in the template
export type ReceiptOrderSummary = {
    orderId: string;
    status: string;
    createdAtFormatted: string; // e.g. "2025-12-09 14:32"
    subtotal: number;
    shippingCost: number;
    total: number;
    currency: string;
};

// Final aggregated data structure that generateHtml / generatePdf will use
export type ReceiptData = {
    order: ReceiptOrderSummary;
    customer: ReceiptCustomer;
    items: ReceiptItem[];
};


// What gatherResources() returns before it is mapped to ReceiptData.
// You can use this inside the service only, or skip it if you prefer.
export type ReceiptResources = {
    order: RemoteOrder;
    user: RemoteUser | null;
    products: RemoteProduct[];
    fortune?: Fortune
};


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- html-template.ts types =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export type ReceiptItemView = {
    name: string;
    quantity: number;
    price: string;
    lineTotal: string;
};

export type ReceiptView = {
    css: string;
    receiptNumber: string;
    date: string;
    orderId: string;
    customerName: string;
    items: ReceiptItemView[];
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    fortuneText?: string;
    fortuneAuthor?: string;
};


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- fortune-client.ts types =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-



// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- auth-client.ts types =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

