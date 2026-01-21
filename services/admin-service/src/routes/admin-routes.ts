import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { Request, Response } from "express";
import { adminService } from "../services/admin-service";
import { StatusCode } from "../models/enums";
import { htmlTemplate } from "../utils/html-template";
import { securityMiddleware } from "../middleware/security-middleware";
import { authClient } from "../clients/auth-client";
import { env } from "../config/env";
import { LoginViewModel } from "../models/types";



const router = Router();

router.get("/login", asyncHandler(async (req: Request, res: Response) => {
    const error = typeof req.query.error === "string" ? req.query.error : undefined;
    const email = typeof req.query.email === "string" ? req.query.email : undefined;
    const next = typeof req.query.next === "string" ? req.query.next : (typeof req.query.redirect === "string" ? req.query.redirect : undefined);

    const view: LoginViewModel = {};
    if (error) view.error = error;
    if (email) view.email = email;
    if (next) view.next = next;

    const html = htmlTemplate.renderLoginPage(view);
    res.status(StatusCode.OK).type("html").send(html);
}));

router.post("/login", asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const next = String(req.body?.next || "").trim();

    try {
        const token = await authClient.login(email, password);

        res.cookie("admin_token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: env.environment === "production",
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

router.get("/",
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    asyncHandler(async (req: Request, res: Response) => {
        const dashboard = await adminService.getDashboard();
        const html = htmlTemplate.renderAdminPanel(dashboard);
        res.status(StatusCode.OK).type("html").send(html);

    }));

router.get("/status",
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    asyncHandler(async (_req: Request, res: Response) => { res.json(await adminService.getDashboard()); }));

export default router;