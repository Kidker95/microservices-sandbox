import request from "supertest";
import { UserRole } from "@ms/common";
import { makeAuthContext } from "../utils/auth";

const loadUserApp = (verifyTokenFactory?: (errors: { UnauthorizedError: any }) => any) => {
    let app: any;
    let userService: any;

    jest.isolateModules(() => {
        const { UnauthorizedError } = require("@ms/common/errors");
        const verifyTokenImpl = verifyTokenFactory
            ? verifyTokenFactory({ UnauthorizedError })
            : jest.fn();
        jest.doMock("@ms/common/clients", () => ({
            AuthClient: jest.fn().mockImplementation(() => ({ verifyToken: verifyTokenImpl }))
        }));
        ({ app } = require("../../services/user-service/src/app-for-test"));
        ({ userService } = require("../../services/user-service/src/services/user-service"));
    });

    return { app, userService };
};

describe("user-service", () => {
    test("health returns service name", async () => {
        const { app } = loadUserApp();
        const res = await request(app).get("/health").expect(200);
        expect(res.body.service).toBe("user-service");
    });

    test("router mounted: GET /api/users returns 401 without token", async () => {
        const { app } = loadUserApp();
        await request(app).get("/api/users").expect(401);
    });

    test("admin-only access contract on GET /api/users", async () => {
        let app = loadUserApp(({ UnauthorizedError }) =>
            jest.fn(async () => { throw new UnauthorizedError("Invalid"); })
        ).app;
        await request(app).get("/api/users").set("Authorization", "Bearer bad").expect(401);

        const { app: adminApp, userService } = loadUserApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        userService.getAllUsers = jest.fn().mockResolvedValue([]);
        await request(adminApp).get("/api/users").set("Authorization", "Bearer admin").expect(200);

        app = loadUserApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        ).app;
        await request(app).get("/api/users").set("Authorization", "Bearer user").expect(403);
    });

    test("owner/admin logic on GET /api/users/:id", async () => {
        const ownerId = "507f1f77bcf86cd799439011";
        const { app, userService } = loadUserApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User, { _id: ownerId }))
        );
        userService.getUserById = jest.fn().mockResolvedValue({ _id: ownerId, email: "x@y.com" });

        await request(app).get(`/api/users/${ownerId}`).set("Authorization", "Bearer owner").expect(200);

        const { app: otherApp } = loadUserApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User, { _id: "not-owner" }))
        );
        await request(otherApp).get(`/api/users/${ownerId}`).set("Authorization", "Bearer other").expect(403);
    });

    test("basic create user returns 201", async () => {
        const { app, userService } = loadUserApp();
        userService.addUser = jest.fn().mockResolvedValue({ _id: "1", email: "a@b.com" });

        await request(app)
            .post("/api/users")
            .send({ email: "a@b.com", name: "A", address: { city: "X" } })
            .expect(201);
    });

    test("GET /api/users/by-email/:email returns 200 and user shape (public)", async () => {
        const { app, userService } = loadUserApp();
        const user = { _id: "507f1f77bcf86cd799439011", email: "test@example.com", role: "user" };
        userService.getUserByEmail = jest.fn().mockResolvedValue(user);

        const res = await request(app)
            .get("/api/users/by-email/test@example.com")
            .expect(200);

        expect(res.body).toMatchObject({ email: "test@example.com" });
        expect(res.body._id).toBeDefined();
    });

    test("PUT /api/users/:id returns 200 (no auth)", async () => {
        const { app, userService } = loadUserApp();
        const updated = { _id: "507f1f77bcf86cd799439011", email: "updated@example.com", name: "Updated" };
        userService.updateUser = jest.fn().mockResolvedValue(updated);

        const res = await request(app)
            .put("/api/users/507f1f77bcf86cd799439011")
            .send({ name: "Updated" })
            .expect(200);

        expect(res.body.email).toBe("updated@example.com");
    });

    test("DELETE /api/users/:id admin only: 401, 403, 204", async () => {
        const { app } = loadUserApp();
        await request(app).delete("/api/users/507f1f77bcf86cd799439011").expect(401);

        const { app: userApp } = loadUserApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        );
        await request(userApp)
            .delete("/api/users/507f1f77bcf86cd799439011")
            .set("Authorization", "Bearer user")
            .expect(403);

        const { app: adminApp, userService } = loadUserApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        userService.deleteUser = jest.fn().mockResolvedValue(undefined);
        await request(adminApp)
            .delete("/api/users/507f1f77bcf86cd799439011")
            .set("Authorization", "Bearer admin")
            .expect(204);
    });

    test("DELETE /api/users admin only: 401, 403, 200", async () => {
        await request(loadUserApp().app).delete("/api/users").expect(401);

        const { app: userApp } = loadUserApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        );
        await request(userApp).delete("/api/users").set("Authorization", "Bearer user").expect(403);

        const { app: adminApp, userService } = loadUserApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        userService.deleteAll = jest.fn().mockResolvedValue(5);
        const res = await request(adminApp)
            .delete("/api/users")
            .set("Authorization", "Bearer admin")
            .expect(200);
        expect(res.body.deleted).toBe(5);
    });
});
