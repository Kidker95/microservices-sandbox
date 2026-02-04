import { StatusCode } from "@ms/common/enums";
import { fetchWithTimeout } from "@ms/common/http";
import { Request, Response, Router } from "express";
import { env } from "../config/env";
import { verifyAdmin, verifyLoggedIn, verifyToken } from "../middleware/security-middleware";
import { LoginViewModel } from "../models/types";
import { adminService } from "../services/admin-service";
import { asyncHandler } from "../utils/async-handler";
import { htmlTemplate } from "../utils/html-template";



const router = Router();

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
}));

router.get("/", verifyToken, verifyLoggedIn, verifyAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const dashboard = await adminService.getDashboard();
        const html = htmlTemplate.renderAdminPanel(dashboard);
        res.status(StatusCode.Ok).type("html").send(html);
    }));

router.get("/status", verifyToken, verifyLoggedIn, verifyAdmin,
    asyncHandler(async (_req: Request, res: Response) => {
        res.json(await adminService.getDashboard());
    }));

export default router;