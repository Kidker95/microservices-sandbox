import { StatusCode } from "@ms/common/enums";
import { BadRequestError } from "@ms/common/errors";
import { Request, Response, Router } from "express";
import { securityMiddleware } from "../middleware/security-middleware";
import { receiptService } from "../services/receipt-service";
import { asyncHandler } from "../utils/async-handler";


const router = Router();



router.get("/:orderId/html", securityMiddleware.verifyLoggedIn.bind(securityMiddleware), asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    if (!orderId) throw new BadRequestError("orderId not provided");
    const requester = (req as any).user;
    const token = req.headers.authorization;
    const html = await receiptService.generateHtml(orderId as string, requester,token);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
}));

router.get("/:orderId/pdf",securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    asyncHandler(async (req: Request, res: Response) => {
        const orderId = req.params.orderId;
        if (!orderId) throw new BadRequestError("orderId not provided");

        const requester = (req as any).user;
        const token = req.headers.authorization;
        const pdf = await receiptService.generatePdf(orderId as string, requester,token);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="receipt-${orderId}.pdf"`);

        return res.status(StatusCode.Ok).send(pdf);
    })
);





export default router;
