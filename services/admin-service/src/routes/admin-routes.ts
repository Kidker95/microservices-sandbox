import { StatusCode } from "@ms/common/enums";
import { fetchWithTimeout } from "@ms/common/http";
import { asyncHandler } from "@ms/common/middleware";
import { Request, Response, Router } from "express";
import path from "path";
import { env } from "../config/env";
import { seedJob } from "../jobs/seed-job";
import { verifyAdmin, verifyLoggedIn, verifyToken } from "../middleware/security-middleware";
import { LoginViewModel } from "../models/types";
import { adminService } from "../services/admin-service";
import { htmlTemplate } from "../utils/html-template";


const router = Router();

router.get("/favicon.png", (_req: Request, res: Response) => {
    const faviconPath = path.join(process.cwd(), "src", "public", "favicon.png");
    res.sendFile(faviconPath);
});

function extractAdminToken(req: Request): string | undefined {
    const cookieToken = (req as any).cookies?.admin_token as string | undefined;
    if (cookieToken) return `Bearer ${cookieToken}`;

    const header = req.headers.authorization;
    if (!header) return undefined;
    return header.startsWith("Bearer ") ? header : `Bearer ${header}`;
}

async function loginWithAuth(email: string, password: string): Promise<string> {
    const res = await fetchWithTimeout(`${env.authServiceBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `Login failed: ${res.status} ${res.statusText}`);

    return data.token as string;
}


router.get("/login", asyncHandler(async (req: Request, res: Response) => {
    const error = typeof req.query.error === "string" ? req.query.error : undefined;
    const email = typeof req.query.email === "string" ? req.query.email : undefined;
    const next = typeof req.query.next === "string" ? req.query.next : (typeof req.query.redirect === "string" ? req.query.redirect : undefined);

    const view: LoginViewModel = {};
    if (error) view.error = error;
    if (email) view.email = email;
    if (next) view.next = next;

    const html = htmlTemplate.renderLoginPage(view);
    res.status(StatusCode.Ok).type("html").send(html);
}));

router.post("/login", asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const next = String(req.body?.next || "").trim();

    try {
        const token = await loginWithAuth(email, password);

        res.cookie("admin_token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: env.environment === "development",
            path: "/"
        });

        const safeNext = next && next.startsWith("/") ? next : "/api/admin";
        return res.redirect(safeNext);

    } catch (err: any) {
        const message = err?.message || "Login failed";

        const view: any = { error: message, email };
        if (next) view.next = next;

        const html = htmlTemplate.renderLoginPage(view);
        return res.status(StatusCode.BadRequest).type("html").send(html);
    }
}));


router.post("/logout", asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("admin_token", { path: "/" });
    res.redirect("/api/admin/login");
}));

router.get("/", verifyToken, verifyLoggedIn, verifyAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const token = extractAdminToken(req);
        const dashboard = await adminService.getDashboard(token);
        const html = htmlTemplate.renderAdminPanel(dashboard);
        res.status(StatusCode.Ok).type("html").send(html);
    }));

router.get("/status", verifyToken, verifyLoggedIn, verifyAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const token = extractAdminToken(req);
        res.json(await adminService.getDashboard(token));
    }));

router.post("/seed/start", verifyToken, verifyLoggedIn, verifyAdmin,
    asyncHandler(async (_req: Request, res: Response) => {
        const started = seedJob.start();
        if (!started.started) return res.status(409).json(started.status);
        return res.status(202).json(started.status);
    }));

router.get("/seed/status", verifyToken, verifyLoggedIn, verifyAdmin,
    asyncHandler(async (_req: Request, res: Response) => {
        return res.status(StatusCode.Ok).json(seedJob.getStatus());
    }));

router.get("/receipts/:orderId/html", verifyToken, verifyLoggedIn, verifyAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const token = extractAdminToken(req);
        if (!token) return res.status(StatusCode.Unauthorized).json({ error: "Missing token" });

        const orderId = req.params.orderId;
        const upstream = await fetchWithTimeout(`${env.receiptServiceBaseUrl}/api/receipts/${orderId}/html`, {
            headers: { Authorization: token }
        });

        if (!upstream.ok) {
            const data = await upstream.json().catch(() => null);
            return res.status(upstream.status).json(data || { error: "Failed to load receipt" });
        }

        const html = await upstream.text();
        res.status(upstream.status);
        res.setHeader("Content-Type", upstream.headers.get("content-type") || "text/html; charset=utf-8");
        return res.send(html);
    }));

router.get("/receipts/:orderId/pdf", verifyToken, verifyLoggedIn, verifyAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const token = extractAdminToken(req);
        if (!token) return res.status(StatusCode.Unauthorized).json({ error: "Missing token" });

        const orderId = req.params.orderId;
        const upstream = await fetchWithTimeout(`${env.receiptServiceBaseUrl}/api/receipts/${orderId}/pdf`, {
            headers: { Authorization: token }
        });

        if (!upstream.ok) {
            const data = await upstream.json().catch(() => null);
            return res.status(upstream.status).json(data || { error: "Failed to load receipt PDF" });
        }

        const contentType = upstream.headers.get("content-type") || "application/pdf";
        const body = new Uint8Array(await upstream.arrayBuffer());
        res.status(upstream.status);
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="receipt-${orderId}.pdf"`);
        return res.send(body);
    }));

export default router;
