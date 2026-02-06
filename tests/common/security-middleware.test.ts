import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { securityMiddleware, errorMiddleware } from "@ms/common";
import { UserRole } from "@ms/common";
import { makeAuthContext } from "../utils/auth";

describe("securityMiddleware", () => {
    test("extracts Bearer token via createVerifyToken", async () => {
        const verifyToken = jest.fn(async () => makeAuthContext(UserRole.User));

        const app = express();
        app.get("/secure",
            securityMiddleware.createVerifyToken({ verifyToken }),
            (_req, res) => res.json({ ok: true })
        );
        app.use(errorMiddleware.routeNotFound);
        app.use(errorMiddleware.catchAll);

        await request(app)
            .get("/secure")
            .set("Authorization", "Bearer token123")
            .expect(200);

        expect(verifyToken).toHaveBeenCalledWith("token123");
    });

    test("supports cookie fallback when enabled", async () => {
        const verifyToken = jest.fn(async () => makeAuthContext(UserRole.User));

        const app = express();
        app.use(cookieParser());
        app.get("/secure",
            securityMiddleware.createVerifyToken(
                { verifyToken },
                { allowCookieFallback: true, cookieName: "admin_token" }
            ),
            (_req, res) => res.json({ ok: true })
        );
        app.use(errorMiddleware.routeNotFound);
        app.use(errorMiddleware.catchAll);

        await request(app)
            .get("/secure")
            .set("Cookie", "admin_token=cookie-token")
            .expect(200);

        expect(verifyToken).toHaveBeenCalledWith("cookie-token");
    });

    test("createVerifyOwnerOrAdmin allows admin", async () => {
        const app = express();
        app.get("/secure",
            (req, _res, next) => {
                req.user = makeAuthContext(UserRole.Admin);
                next();
            },
            securityMiddleware.createVerifyOwnerOrAdmin(() => "owner-id"),
            (_req, res) => res.json({ ok: true })
        );
        app.use(errorMiddleware.routeNotFound);
        app.use(errorMiddleware.catchAll);

        await request(app).get("/secure").expect(200);
    });

    test("createVerifyOwnerOrAdmin allows owner and forbids others", async () => {
        const app = express();
        app.get("/secure",
            (req, _res, next) => {
                req.user = makeAuthContext(UserRole.User, { _id: "owner-id" });
                next();
            },
            securityMiddleware.createVerifyOwnerOrAdmin(() => "owner-id"),
            (_req, res) => res.json({ ok: true })
        );
        app.use(errorMiddleware.routeNotFound);
        app.use(errorMiddleware.catchAll);

        await request(app).get("/secure").expect(200);

        const appForbidden = express();
        appForbidden.get("/secure",
            (req, _res, next) => {
                req.user = makeAuthContext(UserRole.User, { _id: "not-owner" });
                next();
            },
            securityMiddleware.createVerifyOwnerOrAdmin(() => "owner-id"),
            (_req, res) => res.json({ ok: true })
        );
        appForbidden.use(errorMiddleware.routeNotFound);
        appForbidden.use(errorMiddleware.catchAll);

        await request(appForbidden).get("/secure").expect(403);
    });
});
