import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../models/enums";
import { CreateOrderDto, Order } from "../models/types";
import { orderService } from "../services/order-service";

class OrdersController {

    public async getAllOrders(req: Request, res: Response, next: NextFunction) {
        try { return res.json(await orderService.getAllOrders()); }
        catch (err) { next(err); }
    }

    public async getMyOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) return res.status(StatusCode.BadRequest).json({ error: "missing userId" });
            const orders = await orderService.getMyOrders(userId);
            return res.json(orders);
        } catch (err) { next(err); }
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
            const auth = (req as any).user;
            const token = req.headers.authorization;
            const orderPayload = req.body as CreateOrderDto;
            orderPayload.userId = auth.userId;
            const dbOrder = await orderService.addOrder(orderPayload, token);
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
            return res.status(StatusCode.OK).json({ info: `deleted successfully` });

        } catch (err) { next(err); }
    }

    public async deleteAll(req: Request, res: Response, next: NextFunction) {
        try {
            const deletedCount = await orderService.deleteAll();
            return res.status(StatusCode.OK).json({ deleted: deletedCount });
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

    public async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing product _id" });
            const product = await orderService.getProductById(_id);
            return product ? res.json(product) : res.status(StatusCode.NotFound).json({ error: `product not found` });

        } catch (err) { next(err); }
    }



}


export const ordersController = new OrdersController();
