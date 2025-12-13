import { Request, Response, Router } from "express";
import { BadRequestError, NotFoundError } from "../models/errors";
import { receiptService } from "../services/receipt-service";
import { StatusCode } from "../models/enums";
import { asyncHandler } from "../utils/async-handler";


const router = Router();



router.get("/:orderId/html", asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    if (!orderId) throw new BadRequestError("orderId not provided");
    const html = await receiptService.generateHtml(orderId);
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.send(html);
}));

router.get("/:orderId/pdf", asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    if (!orderId) throw new BadRequestError("orderId not provided");

    const pdf = await receiptService.generatePdf(orderId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="receipt-${orderId}.pdf"`);

    return res.status(StatusCode.OK).send(pdf);
}));





export default router;
