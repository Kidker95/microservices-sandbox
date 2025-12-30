import { Fortune, ReceiptResources, ReceiptData, ReceiptView } from "../models/types";
import { orderClient } from "../clients/order-client";
import { userClient } from "../clients/user-client";
import { productClient } from "../clients/product-client";
import { htmlTemplate } from "../utils/html-template";
import { chromium } from "playwright";
import { pdfBrowser } from "../utils/pdf-browser";
import { fortuneClient } from "../clients/fortune-client";
import { ForbiddenError } from "../models/errors";
import { UserRole } from "../models/enums";
import { AuthContext } from "../models/types";




class ReceiptService {

    // formaters:

    private formatDate(value: string | Date): string {
        const d = typeof value === "string" ? new Date(value) : value;
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleString(); // later you can set locale/timezone explicitly
    }

    private formatMoney(amount: number, currency: string): string {
        const safeAmount = Number.isFinite(amount) ? amount : 0;

        try {
            return new Intl.NumberFormat("he-IL", {
                style: "currency",
                currency,
                currencyDisplay: "symbol",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(safeAmount);
        } catch {
            const rounded = Math.round(safeAmount * 100) / 100;
            return `${currency} ${rounded.toFixed(2)}`;
        }
    }


    // helpers:

    private async gatherResources(orderId: string, requester: AuthContext): Promise<ReceiptResources> {
        const order = await orderClient.getOrderById(orderId);
    
        const isAdmin = requester.role === UserRole.Admin;
        const isOwner = requester.userId === order.userId;
    
        if (!isAdmin && !isOwner) throw new ForbiddenError("Forbidden");
    
        const userPromise = userClient.getUserById(order.userId);
    
        const productIds = [...new Set(order.items.map(item => item.productId))];
        const productsPromise = productClient.getProductsByIdArr(productIds);
    
        const fortunePromise = fortuneClient.getFortune();
    
        const [user, products, fortunes] = await Promise.all([userPromise, productsPromise, fortunePromise]);
    
        const resources: ReceiptResources = { order, user, products };
    
        const firstFortune = fortunes[0];
        if (firstFortune) resources.fortune = firstFortune;
    
        return resources;
    }
    


    private mapToReceiptData(resources: ReceiptResources): ReceiptData {
        const { order, user, products } = resources;

        const currency = order.items[0]?.currency || "ILS";

        if (!order.items || order.items.length === 0) {
            return {
                order: {
                    orderId: order._id,
                    status: order.status,
                    createdAtFormatted: new Date(order.createdAt).toISOString(),
                    subtotal: order.subtotal,
                    shippingCost: order.shippingCost,
                    total: order.total,
                    currency,
                },
                customer: {
                    name: user ? user.name : order.shippingAddress.fullName,
                    email: user ? user.email : "",
                    address: order.shippingAddress,
                },
                items: []
            };
        }


        return {
            order: {
                orderId: order._id,
                status: order.status,
                createdAtFormatted: new Date(order.createdAt).toISOString(), // you can prettify later
                subtotal: order.subtotal,
                shippingCost: order.shippingCost,
                total: order.total,
                currency,
            },
            customer: {
                name: user ? user.name : order.shippingAddress.fullName,
                email: user ? user.email : "",
                address: order.shippingAddress,
            },
            items: order.items.map(item => {
                const product = products.find(p => p._id === item.productId);

                const sku = product?.sku ?? item.sku;
                const size = item.size;
                const color = item.color;

                return {
                    name: product?.name || item.name,
                    ...(sku ? { sku } : {}),
                    ...(size ? { size } : {}),
                    ...(color ? { color } : {}),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    currency: item.currency,
                    lineTotal: item.quantity * item.unitPrice
                };
            }),

        };
    }

    private mapToReceiptView(receipt: ReceiptData, fortune?: Fortune): Omit<ReceiptView, "css"> {
        const currency = receipt.order.currency || "ILS";
    
        const items = receipt.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: this.formatMoney(item.unitPrice, currency),
            lineTotal: this.formatMoney(item.lineTotal, currency)
        }));
    
        const tax = 0;
    
        const view: Omit<ReceiptView, "css"> = {
            receiptNumber: receipt.order.orderId,
            date: this.formatDate(receipt.order.createdAtFormatted),
            orderId: receipt.order.orderId,
            customerName: receipt.customer.name,
            items,
            subtotal: this.formatMoney(receipt.order.subtotal, currency),
            shipping: this.formatMoney(receipt.order.shippingCost, currency),
            tax: this.formatMoney(tax, currency),
            total: this.formatMoney(receipt.order.total, currency)
        };
    
        if (fortune) {
            view.fortuneText = fortune.fortune;
            view.fortuneAuthor = fortune.author;
        }
    
        return view;
    }
    

    public async generateHtml(orderId: string, requester: AuthContext): Promise<string> {
        const resources = await this.gatherResources(orderId, requester);
        const receipt = this.mapToReceiptData(resources);
        const view = this.mapToReceiptView(receipt, resources.fortune);
        return htmlTemplate.renderReceiptHtml(view);
    }
    
    public async generatePdf(orderId: string, requester: AuthContext): Promise<Buffer> {
        const html = await this.generateHtml(orderId, requester);
    
        const browser = await pdfBrowser.getBrowser();
        const page = await browser.newPage();
    
        try {
            await page.setContent(html, { waitUntil: "load" });
    
            const pdf = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" }
            });
    
            return Buffer.from(pdf);
        } finally { await page.close(); }
    }
    


}

export const receiptService = new ReceiptService();