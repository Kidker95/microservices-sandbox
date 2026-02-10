import request from "supertest";
import { UserRole } from "@ms/common";
import { makeAuthContext } from "../utils/auth";

type FetchMock = (url: string, init?: RequestInit) => Promise<Response>;

const loadAdminApp = (
    verifyTokenFactory?: (errors: { UnauthorizedError: any }) => any,
    fetchWithTimeoutMock?: FetchMock
) => {
    let app: any;
    let adminService: any;

    jest.isolateModules(() => {
        const { UnauthorizedError } = require("@ms/common/errors");
        const verifyTokenImpl = verifyTokenFactory
            ? verifyTokenFactory({ UnauthorizedError })
            : jest.fn();
        jest.doMock("@ms/common/clients", () => ({
            AuthClient: jest.fn().mockImplementation(() => ({ verifyToken: verifyTokenImpl }))
        }));
        jest.doMock("../../services/admin-service/src/utils/html-template", () => ({
            htmlTemplate: {
                renderAdminPanel: () => "<html>admin</html>",
                renderLoginPage: () => "<html>login</html>"
            }
        }));

        if (fetchWithTimeoutMock) {
            jest.doMock("@ms/common/http", () => ({
                fetchWithTimeout: fetchWithTimeoutMock
            }));
        }

        ({ app } = require("../../services/admin-service/src/app-for-test"));
        ({ adminService } = require("../../services/admin-service/src/services/admin-service"));
    });

    return { app, adminService };
};

describe("admin-service", () => {
    test("health returns service name", async () => {
        const { app } = loadAdminApp();
        const res = await request(app).get("/health").expect(200);
        expect(res.body.service).toBe("admin-service");
    });

    test("router mounted: unauthenticated GET /api/admin redirects to login", async () => {
        const { app } = loadAdminApp();
        const res = await request(app)
            .get("/api/admin")
            .set("Accept", "text/html")
            .expect(302);
        expect(res.headers.location).toContain("/api/admin/login");
    });

    test("admin-only access contract on GET /api/admin", async () => {
        let app = loadAdminApp(({ UnauthorizedError }) =>
            jest.fn(async () => { throw new UnauthorizedError("Invalid"); })
        ).app;
        await request(app)
            .get("/api/admin")
            .set("Accept", "text/html")
            .set("Authorization", "Bearer bad")
            .expect(302);

        const { app: adminApp, adminService } = loadAdminApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        adminService.getDashboard = jest.fn().mockResolvedValue({ services: [], summary: { total: 0, up: 0, down: 0 } });
        await request(adminApp)
            .get("/api/admin")
            .set("Accept", "text/html")
            .set("Authorization", "Bearer admin")
            .expect(200);

        app = loadAdminApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        ).app;
        await request(app)
            .get("/api/admin")
            .set("Accept", "text/html")
            .set("Authorization", "Bearer user")
            .expect(403);
    });

    test("POST /api/admin/login success sets cookie and redirects", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ token: "admin-token-123" })
        });
        const { app } = loadAdminApp(undefined, fetchMock);

        const res = await request(app)
            .post("/api/admin/login")
            .send({ email: "admin@example.com", password: "secret" })
            .expect(302);

        expect(res.headers.location).toBe("/api/admin");
        expect(res.headers["set-cookie"]).toBeDefined();
        expect(res.headers["set-cookie"]?.[0]).toContain("admin_token=admin-token-123");
    });

    test("POST /api/admin/login failure returns 400", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            json: () => Promise.resolve({ error: "Invalid credentials" })
        });
        const { app } = loadAdminApp(undefined, fetchMock);

        await request(app)
            .post("/api/admin/login")
            .send({ email: "admin@example.com", password: "wrong" })
            .expect(400);
    });

    test("POST /api/admin/logout clears cookie and redirects to login", async () => {
        const { app } = loadAdminApp();

        const res = await request(app)
            .post("/api/admin/logout")
            .expect(302);

        expect(res.headers.location).toBe("/api/admin/login");
        expect(res.headers["set-cookie"]).toBeDefined();
        expect(res.headers["set-cookie"]?.[0]).toMatch(/admin_token=;/);
    });

    test("GET /api/admin/status requires auth and returns JSON", async () => {
        const { app } = loadAdminApp();
        await request(app).get("/api/admin/status").set("Accept", "application/json").expect(401);

        const { app: adminApp, adminService } = loadAdminApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        adminService.getDashboard = jest.fn().mockResolvedValue({
            services: [{ name: "auth", ok: true }],
            summary: { total: 1, up: 1, down: 0 },
            orders: [],
            seedJob: { state: "idle", percent: 0, message: "Idle" }
        });

        const res = await request(adminApp)
            .get("/api/admin/status")
            .set("Authorization", "Bearer admin")
            .expect(200);

        expect(res.body).toHaveProperty("services");
        expect(res.body).toHaveProperty("summary");
        expect(res.body).toHaveProperty("seedJob");
    });

    test("POST /api/admin/seed/start requires auth and admin", async () => {
        const { app } = loadAdminApp();
        await request(app).post("/api/admin/seed/start").set("Accept", "application/json").expect(401);

        const appUser = loadAdminApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.User))
        ).app;
        await request(appUser)
            .post("/api/admin/seed/start")
            .set("Authorization", "Bearer user")
            .expect(403);

        const { app: adminApp } = loadAdminApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        const res = await request(adminApp)
            .post("/api/admin/seed/start")
            .set("Authorization", "Bearer admin")
            .expect(202);

        expect(res.body).toHaveProperty("state");
        expect(res.body).toHaveProperty("percent");
    });

    test("POST /api/admin/seed/start returns 409 when already running", async () => {
        const mockStart = jest.fn().mockReturnValue({
            started: false,
            status: { state: "running", percent: 50, message: "Seeding..." }
        });
        let app: any;
        jest.isolateModules(() => {
            jest.doMock("@ms/common/clients", () => ({
                AuthClient: jest.fn().mockImplementation(() => ({
                    verifyToken: jest.fn(async () => makeAuthContext(UserRole.Admin))
                }))
            }));
            jest.doMock("../../services/admin-service/src/utils/html-template", () => ({
                htmlTemplate: {
                    renderAdminPanel: () => "<html>admin</html>",
                    renderLoginPage: () => "<html>login</html>"
                }
            }));
            jest.doMock("../../services/admin-service/src/jobs/seed-job", () => ({
                seedJob: { start: mockStart, getStatus: () => ({ state: "idle" }) }
            }));
            ({ app } = require("../../services/admin-service/src/app-for-test"));
        });

        const res = await request(app)
            .post("/api/admin/seed/start")
            .set("Authorization", "Bearer admin")
            .expect(409);

        expect(res.body.state).toBe("running");
    });

    test("GET /api/admin/seed/status requires auth and returns job state", async () => {
        const { app } = loadAdminApp();
        await request(app).get("/api/admin/seed/status").set("Accept", "application/json").expect(401);

        const { app: adminApp } = loadAdminApp(() =>
            jest.fn(async () => makeAuthContext(UserRole.Admin))
        );
        const res = await request(adminApp)
            .get("/api/admin/seed/status")
            .set("Authorization", "Bearer admin")
            .expect(200);

        expect(res.body).toHaveProperty("state");
    });

    test("GET /api/admin/receipts/:orderId/html requires auth and proxies response", async () => {
        const orderId = "507f1f77bcf86cd799439011";
        const { app } = loadAdminApp();
        await request(app).get(`/api/admin/receipts/${orderId}/html`).set("Accept", "application/json").expect(401);

        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            headers: { get: () => "text/html; charset=utf-8" },
            text: () => Promise.resolve("<html>receipt</html>")
        });
        const { app: adminApp } = loadAdminApp(
            () => jest.fn(async () => makeAuthContext(UserRole.Admin)),
            fetchMock
        );

        const res = await request(adminApp)
            .get(`/api/admin/receipts/${orderId}/html`)
            .set("Authorization", "Bearer admin")
            .expect(200);

        expect(res.headers["content-type"]).toContain("text/html");
        expect(res.text).toBe("<html>receipt</html>");
    });

    test("GET /api/admin/receipts/:orderId/pdf requires auth and proxies PDF", async () => {
        const orderId = "507f1f77bcf86cd799439011";
        const pdfBuffer = Buffer.from("fake-pdf-content");
        const { app } = loadAdminApp();
        await request(app).get(`/api/admin/receipts/${orderId}/pdf`).set("Accept", "application/json").expect(401);

        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            headers: { get: () => "application/pdf" },
            arrayBuffer: () => Promise.resolve(pdfBuffer.buffer)
        });
        const { app: adminApp } = loadAdminApp(
            () => jest.fn(async () => makeAuthContext(UserRole.Admin)),
            fetchMock
        );

        const res = await request(adminApp)
            .get(`/api/admin/receipts/${orderId}/pdf`)
            .set("Authorization", "Bearer admin")
            .expect(200);

        expect(res.headers["content-type"]).toContain("application/pdf");
        expect(res.body).toBeDefined();
        expect(res.body.length).toBeGreaterThan(0);
    });
});
