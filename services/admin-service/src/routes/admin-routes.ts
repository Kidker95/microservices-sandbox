import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { Request, Response } from "express";
import { adminService } from "../services/admin-service";
import { StatusCode } from "../models/enums";
import { htmlTemplate } from "../utils/html-template";



const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response) => {
    const dashboard = await adminService.getDashboard();
    const html = htmlTemplate.renderAdminPanel(dashboard);
    res.status(StatusCode.OK).type("html").send(html);

}));

router.get("/status", asyncHandler(async (_req: Request, res: Response) => { res.json(await adminService.getDashboard()); }));

export default router;