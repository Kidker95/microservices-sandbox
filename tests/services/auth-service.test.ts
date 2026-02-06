import request from "supertest";
import { UserRole } from "@ms/common";
import { makeAuthContext } from "../utils/auth";

const loadAuthAppForLogin = () => {
    let app: any;
    let CredentialsModel: any;
    let hashing: any;
    let userClient: any;

    jest.isolateModules(() => {
        jest.doMock("../../services/auth-service/src/models/credentials-model", () => ({
            CredentialsModel: { findOne: jest.fn() }
        }));
        jest.doMock("../../services/auth-service/src/utils/hashing", () => ({
            hashing: {
                verifyPassword: jest.fn(),
                hashPassword: jest.fn()
            }
        }));
        jest.doMock("../../services/auth-service/src/clients/user-client", () => ({
            userClient: { getUserByEmail: jest.fn(), createUser: jest.fn() }
        }));

        ({ app } = require("../../services/auth-service/src/app-for-test"));
        ({ CredentialsModel } = require("../../services/auth-service/src/models/credentials-model"));
        ({ hashing } = require("../../services/auth-service/src/utils/hashing"));
        ({ userClient } = require("../../services/auth-service/src/clients/user-client"));
    });

    return { app, CredentialsModel, hashing, userClient };
};

const loadAuthAppWithMockedAuthService = (
    verifyTokenFactory: (errors: { UnauthorizedError: any }) => any,
    deleteAllImpl: any
) => {
    let app: any;
    jest.isolateModules(() => {
        const { UnauthorizedError } = require("@ms/common/errors");
        const verifyTokenImpl = verifyTokenFactory({ UnauthorizedError });
        jest.doMock("../../services/auth-service/src/services/auth-service", () => ({
            authService: {
                verifyToken: verifyTokenImpl,
                deleteAllExceptEmail: deleteAllImpl,
                register: jest.fn(),
                login: jest.fn(),
                logout: jest.fn()
            }
        }));
        ({ app } = require("../../services/auth-service/src/app-for-test"));
    });
    return { app };
};

describe("auth-service", () => {
    test("health returns service name", async () => {
        const { app } = loadAuthAppForLogin();
        const res = await request(app).get("/health").expect(200);
        expect(res.body.service).toBe("auth-service");
    });

    test("login returns token and verify returns AuthContext", async () => {
        const { app, CredentialsModel, hashing, userClient } = loadAuthAppForLogin();

        const userId = "507f1f77bcf86cd799439011";
        CredentialsModel.findOne.mockResolvedValue({
            email: "admin@example.com",
            passwordHash: "hash",
            userId
        });
        hashing.verifyPassword.mockResolvedValue(true);
        userClient.getUserByEmail.mockResolvedValue({
            _id: userId,
            role: UserRole.Admin,
            email: "admin@example.com"
        });

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@example.com", password: "pw" })
            .expect(200);

        expect(typeof loginRes.body.token).toBe("string");

        const verifyRes = await request(app)
            .get("/api/auth/verify")
            .set("Authorization", `Bearer ${loginRes.body.token}`)
            .expect(200);

        expect(verifyRes.body._id).toBe(userId);
        expect(verifyRes.body.role).toBe(UserRole.Admin);
        expect(verifyRes.body.email).toBe("admin@example.com");
    });

    test("seed-wipe auth contract: missing/invalid/admin/user", async () => {
        const deleteAllExceptEmail = jest.fn().mockResolvedValue(3);

        // missing token -> 401
        let app = loadAuthAppWithMockedAuthService(() => jest.fn(), deleteAllExceptEmail).app;
        await request(app).delete("/api/auth/seed-wipe").expect(401);

        // invalid token -> 401
        app = loadAuthAppWithMockedAuthService(({ UnauthorizedError }) =>
            jest.fn(async () => { throw new UnauthorizedError("Invalid token"); })
        , deleteAllExceptEmail).app;
        await request(app)
            .delete("/api/auth/seed-wipe")
            .set("Authorization", "Bearer bad")
            .expect(401);

        // admin -> 200 (with seed header)
        app = loadAuthAppWithMockedAuthService(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        , deleteAllExceptEmail).app;
        await request(app)
            .delete("/api/auth/seed-wipe")
            .set("Authorization", "Bearer good")
            .set("x-seed-wipe", "true")
            .expect(200);

        // normal user -> 403
        app = loadAuthAppWithMockedAuthService(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        , deleteAllExceptEmail).app;
        await request(app)
            .delete("/api/auth/seed-wipe")
            .set("Authorization", "Bearer user")
            .set("x-seed-wipe", "true")
            .expect(403);
    });
});
