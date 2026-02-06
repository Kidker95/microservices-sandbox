import { Router } from "express";
import request from "supertest";
import { createServiceApp } from "@ms/common";

describe("createServiceApp", () => {
    test("mounts /health with service name", async () => {
        const router = Router();
        const { app } = createServiceApp({
            serviceName: "test-service",
            port: 0,
            basePath: "/api/test",
            router
        });

        const res = await request(app).get("/health").expect(200);
        expect(res.body.service).toBe("test-service");
        expect(res.body.status).toBe("ok");
    });

    test("mounts router under basePath", async () => {
        const router = Router();
        router.get("/ping", (_req, res) => res.json({ pong: true }));

        const { app } = createServiceApp({
            serviceName: "test-service",
            port: 0,
            basePath: "/api/test",
            router
        });

        await request(app).get("/api/test/ping").expect(200);
    });

    test("uses cookies only when enabled", async () => {
        const router = Router();
        router.get("/cookies", (req, res) => {
            res.json({ hasCookie: Boolean((req as any).cookies?.foo) });
        });

        const { app: withCookies } = createServiceApp({
            serviceName: "test-service",
            port: 0,
            basePath: "/api/test",
            router,
            enableCookies: true
        });

        const resWith = await request(withCookies)
            .get("/api/test/cookies")
            .set("Cookie", "foo=bar")
            .expect(200);
        expect(resWith.body.hasCookie).toBe(true);

        const routerNoCookies = Router();
        routerNoCookies.get("/cookies", (req, res) => {
            res.json({ hasCookie: Boolean((req as any).cookies?.foo) });
        });

        const { app: withoutCookies } = createServiceApp({
            serviceName: "test-service",
            port: 0,
            basePath: "/api/test",
            router: routerNoCookies,
            enableCookies: false
        });

        const resWithout = await request(withoutCookies)
            .get("/api/test/cookies")
            .set("Cookie", "foo=bar")
            .expect(200);
        expect(resWithout.body.hasCookie).toBe(false);
    });

    test("allows overriding error middleware", async () => {
        const router = Router();
        const { app } = createServiceApp({
            serviceName: "test-service",
            port: 0,
            basePath: "/api/test",
            router,
            error: {
                routeNotFound: (_req, res) => res.status(418).json({ error: "not found" }),
                catchAll: (_err, _req, res, _next) => res.status(500).json({ error: "boom" })
            }
        });

        await request(app).get("/missing").expect(418);
    });
});
