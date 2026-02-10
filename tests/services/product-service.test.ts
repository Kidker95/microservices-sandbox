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

    test("GET /api/products/:id returns 200 and product shape (public)", async () => {
        const { app, productService } = loadProductApp();
        const product = { _id: "507f1f77bcf86cd799439011", name: "Widget", price: 10, stock: 5 };
        productService.getProductById = jest.fn().mockResolvedValue(product);

        const res = await request(app).get("/api/products/507f1f77bcf86cd799439011").expect(200);
        expect(res.body).toMatchObject({ name: "Widget", price: 10 });
    });

    test("PUT /api/products/:id admin only: 401, 403, 200", async () => {
        const { app } = loadProductApp();
        await request(app)
            .put("/api/products/507f1f77bcf86cd799439011")
            .send({ name: "Updated" })
            .expect(401);

        const { app: userApp } = loadProductApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        );
        await request(userApp)
            .put("/api/products/507f1f77bcf86cd799439011")
            .set("Authorization", "Bearer user")
            .send({ name: "Updated" })
            .expect(403);

        const { app: adminApp, productService } = loadProductApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        productService.updateProduct = jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439011",
            name: "Updated",
            price: 15
        });
        const res = await request(adminApp)
            .put("/api/products/507f1f77bcf86cd799439011")
            .set("Authorization", "Bearer admin")
            .send({ name: "Updated", price: 15 })
            .expect(200);
        expect(res.body.name).toBe("Updated");
    });

    test("DELETE /api/products/:id admin only: 401, 403, 200", async () => {
        const { app } = loadProductApp();
        await request(app).delete("/api/products/507f1f77bcf86cd799439011").expect(401);

        const { app: userApp } = loadProductApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        );
        await request(userApp)
            .delete("/api/products/507f1f77bcf86cd799439011")
            .set("Authorization", "Bearer user")
            .expect(403);

        const { app: adminApp, productService } = loadProductApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        productService.deleteProduct = jest.fn().mockResolvedValue(undefined);
        await request(adminApp)
            .delete("/api/products/507f1f77bcf86cd799439011")
            .set("Authorization", "Bearer admin")
            .expect(200);
    });
});
