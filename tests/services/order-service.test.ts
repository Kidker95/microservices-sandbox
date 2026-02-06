import { UserRole } from "@ms/common";
import request from "supertest";
import { makeAuthContext } from "../utils/auth";

const loadOrderApp = (verifyTokenFactory?: (errors: { UnauthorizedError: any }) => any) => {
    let app: any;
    let orderService: any;

    jest.isolateModules(() => {
        const { UnauthorizedError } = require("@ms/common/errors");
        const verifyTokenImpl = verifyTokenFactory
            ? verifyTokenFactory({ UnauthorizedError })
            : jest.fn();
        jest.doMock("@ms/common/clients", () => ({
            AuthClient: jest.fn().mockImplementation(() => ({ verifyToken: verifyTokenImpl }))
        }));
        ({ app } = require("../../services/order-service/src/app-for-test"));
        ({ orderService } = require("../../services/order-service/src/services/order-service"));
    });

    return { app, orderService };
};

describe("order-service", () => {
    test("health returns service name", async () => {
        const { app } = loadOrderApp();
        const res = await request(app).get("/health").expect(200);
        expect(res.body.service).toBe("order-service");
    });

    test("router mounted: GET /api/orders returns 401 without token", async () => {
        const { app } = loadOrderApp();
        await request(app).get("/api/orders").expect(401);
    });

    test("admin-only access contract on GET /api/orders", async () => {
        let app = loadOrderApp(({ UnauthorizedError }) =>
            jest.fn(async () => { throw new UnauthorizedError("Invalid"); })
        ).app;
        await request(app).get("/api/orders").set("Authorization", "Bearer bad").expect(401);

        const { app: adminApp, orderService } = loadOrderApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        orderService.getAllOrders = jest.fn().mockResolvedValue([]);
        await request(adminApp).get("/api/orders").set("Authorization", "Bearer admin").expect(200);

        app = loadOrderApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        ).app;
        await request(app).get("/api/orders").set("Authorization", "Bearer user").expect(403);
    });

    test("owner/admin enforcement on GET /api/orders/:id and DELETE /api/orders/:id", async () => {
        const orderId = "507f1f77bcf86cd799439011";
        const { app, orderService } = loadOrderApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User, { _id: orderId }))
        );

        const order = {
            _id: orderId,
            userId: orderId,
            items: [],
            status: "pending",
            subtotal: 0,
            shippingCost: 0,
            total: 0,
            shippingAddress: { fullName: "A" }
        };
        orderService.getOrderById = jest.fn().mockResolvedValue(order);

        await request(app)
            .get(`/api/orders/${orderId}`)
            .set("Authorization", "Bearer owner")
            .expect(200);

        const { app: otherApp, orderService: otherService } = loadOrderApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User, { _id: "not-owner" }))
        );
        otherService.getOrderById = jest.fn().mockResolvedValue(order);

        await request(otherApp)
            .delete(`/api/orders/${orderId}`)
            .set("Authorization", "Bearer other")
            .expect(403);
    });
});
