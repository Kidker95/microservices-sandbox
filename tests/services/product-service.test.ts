import { UserRole } from "@ms/common";
import request from "supertest";
import { makeAuthContext } from "../utils/auth";

const loadProductApp = (verifyTokenFactory?: (errors: { UnauthorizedError: any }) => any) => {
    let app: any;
    let productService: any;

    jest.isolateModules(() => {
        const { UnauthorizedError } = require("@ms/common/errors");
        const verifyTokenImpl = verifyTokenFactory
            ? verifyTokenFactory({ UnauthorizedError })
            : jest.fn();
        jest.doMock("@ms/common/clients", () => ({
            AuthClient: jest.fn().mockImplementation(() => ({ verifyToken: verifyTokenImpl }))
        }));
        ({ app } = require("../../services/product-service/src/app-for-test"));
        ({ productService } = require("../../services/product-service/src/services/product-service"));
    });

    return { app, productService };
};

describe("product-service", () => {
    test("health returns service name", async () => {
        const { app } = loadProductApp();
        const res = await request(app).get("/health").expect(200);
        expect(res.body.service).toBe("product-service");
    });

    test("router mounted: GET /api/products returns 200", async () => {
        const { app, productService } = loadProductApp();
        productService.getAllProducts = jest.fn().mockResolvedValue([]);
        await request(app).get("/api/products").expect(200);
    });

    test("admin-only access contract on POST /api/products", async () => {
        let app = loadProductApp(({ UnauthorizedError }) =>
            jest.fn(async () => { throw new UnauthorizedError("Invalid"); })
        ).app;
        await request(app).post("/api/products").set("Authorization", "Bearer bad").expect(401);

        const { app: adminApp, productService } = loadProductApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        productService.addProduct = jest.fn().mockResolvedValue({ _id: "1", name: "P" });
        await request(adminApp)
            .post("/api/products")
            .set("Authorization", "Bearer admin")
            .send({ name: "P", price: 10 })
            .expect(201);

        app = loadProductApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        ).app;
        await request(app)
            .post("/api/products")
            .set("Authorization", "Bearer user")
            .send({ name: "P", price: 10 })
            .expect(403);
    });
});
