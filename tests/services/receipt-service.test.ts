import request from "supertest";
import { UserRole } from "@ms/common";
import { makeAuthContext } from "../utils/auth";

const loadReceiptApp = (verifyTokenImpl: any, receiptServiceMock?: { generatePdf?: jest.Mock }) => {
    let app: any;
    let orderClient: any;
    let userClient: any;
    let productClient: any;
    let fortuneClient: any;

    jest.isolateModules(() => {
        jest.doMock("@ms/common/clients", () => ({
            AuthClient: jest.fn().mockImplementation(() => ({ verifyToken: verifyTokenImpl }))
        }));
        jest.doMock("../../services/receipt-service/src/utils/html-template", () => ({
            htmlTemplate: {
                renderReceiptHtml: (view: any) =>
                    `<html>${view.orderId}|${view.customerName}|${view.total}</html>`
            }
        }));

        if (receiptServiceMock?.generatePdf) {
            jest.doMock("../../services/receipt-service/src/services/receipt-service", () => ({
                receiptService: {
                    generateHtml: jest.fn(),
                    generatePdf: receiptServiceMock.generatePdf
                }
            }));
        }

        ({ app } = require("../../services/receipt-service/src/app-for-test"));
        ({ orderClient } = require("../../services/receipt-service/src/clients/order-client"));
        ({ userClient } = require("../../services/receipt-service/src/clients/user-client"));
        ({ productClient } = require("../../services/receipt-service/src/clients/product-client"));
        ({ fortuneClient } = require("../../services/receipt-service/src/clients/fortune-client"));
    });

    return { app, orderClient, userClient, productClient, fortuneClient };
};

describe("receipt-service", () => {
    test("health returns service name", async () => {
        const { app } = loadReceiptApp(jest.fn());
        const res = await request(app).get("/health").expect(200);
        expect(res.body.service).toBe("receipt-service");
    });

    test("router mounted: GET /api/receipts/:id/html returns 401 without token", async () => {
        const { app } = loadReceiptApp(jest.fn());
        await request(app).get("/api/receipts/507f1f77bcf86cd799439011/html").expect(401);
    });

    test("html endpoint returns text/html and includes key markers", async () => {
        const userId = "507f1f77bcf86cd799439011";
        const orderId = "507f1f77bcf86cd799439012";
        const authVerify = jest.fn(async () => makeAuthContext(UserRole.User, { _id: userId }));
        const { app, orderClient, userClient, productClient, fortuneClient } = loadReceiptApp(authVerify);

        orderClient.getOrderById = jest.fn().mockResolvedValue({
            _id: orderId,
            userId,
            status: "paid",
            createdAt: new Date().toISOString(),
            subtotal: 100,
            shippingCost: 10,
            total: 110,
            items: [{
                productId: "507f1f77bcf86cd799439013",
                sku: "SKU1",
                name: "Product 1",
                size: "M",
                color: "red",
                quantity: 1,
                unitPrice: 100,
                currency: "USD"
            }],
            shippingAddress: { fullName: "Jane Doe" }
        });
        userClient.getUserById = jest.fn().mockResolvedValue({
            _id: userId,
            name: "Jane Doe",
            email: "jane@example.com",
            role: UserRole.User
        });
        productClient.getProductsByIdArr = jest.fn().mockResolvedValue([{
            _id: "507f1f77bcf86cd799439013",
            name: "Product 1",
            sku: "SKU1",
            price: 100,
            currency: "USD",
            isActive: true
        }]);
        fortuneClient.getFortune = jest.fn().mockResolvedValue([{
            fortune: "Great things",
            author: "Anon",
            source: "test",
            fetchedAt: new Date().toISOString()
        }]);

        const res = await request(app)
            .get(`/api/receipts/${orderId}/html`)
            .set("Authorization", "Bearer good")
            .expect(200);

        expect(res.headers["content-type"]).toContain("text/html");
        expect(res.text).toContain(orderId);
        expect(res.text).toContain("Jane Doe");
        expect(res.text).toContain("110");
    });

    test("GET /api/receipts/:id/pdf returns 200, application/pdf, non-empty body", async () => {
        const orderId = "507f1f77bcf86cd799439012";
        const pdfBuffer = Buffer.from("%PDF-1.4 mock pdf content");
        const authVerify = jest.fn(async () => makeAuthContext(UserRole.User));
        const { app } = loadReceiptApp(authVerify, {
            generatePdf: jest.fn().mockResolvedValue(pdfBuffer)
        });

        const res = await request(app)
            .get(`/api/receipts/${orderId}/pdf`)
            .set("Authorization", "Bearer good")
            .expect(200);

        expect(res.headers["content-type"]).toContain("application/pdf");
        expect(Buffer.isBuffer(res.body) || res.body?.length > 0).toBe(true);
    });
});
