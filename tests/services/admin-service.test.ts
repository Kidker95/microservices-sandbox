import request from "supertest";
import { UserRole } from "@ms/common";
import { makeAuthContext } from "../utils/auth";

const loadAdminApp = (verifyTokenFactory?: (errors: { UnauthorizedError: any }) => any) => {
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
});
