import { NextFunction, Request, Response } from "express";
import { orderService } from "../services/order-service";
import { StatusCode } from "../models/enums";
import { Order } from "../models/types";

class OrdersController {

    public async getAllOrders(req: Request, res: Response, next: NextFunction) {
        try { return res.json(await orderService.getAllOrders()); }
        catch (err) { next(err); }
    }

    public async getOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing order _id" });

            const order = await orderService.getOrderById(_id);
            return res.json(order);
        } catch (err) { next(err); }
    }

    public async addOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const orderPayload = req.body as Omit<Order, "_id" | "createdAt" | "updatedAt">;
            const dbOrder = await orderService.addOrder(orderPayload);
            return res.status(StatusCode.Created).json(dbOrder);
        } catch (err) { next(err); }
    }

    public async updateOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing order _id" });

            const updatedOrderData = req.body as Partial<Omit<Order, "_id" | "createdAt" | "updatedAt">>;
            const dbOrder = await orderService.updateOrder(_id, updatedOrderData);
            return res.json(dbOrder);

        } catch (err) { next(err); }
    }

    public async deleteOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing order _id" });

            await orderService.deleteOrder(_id);
            return res.status(StatusCode.OK).json({info: `deleted successfully`});

        } catch (err) { next(err); }
    }

    public async getOrderWithUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId, userId } = req.params;
            if (!orderId || !userId) return res.status(StatusCode.BadRequest).json({ error: "Missing orderId or userId" });


            const result = await orderService.getOrderWithUser(orderId, userId);
            return res.json(result);
        } catch (err) { next(err); }



    }
}

export const ordersController = new OrdersController();
