import { AuthClient } from "@ms/common/clients";
import { securityMiddleware } from "@ms/common/middleware";
import express from "express";
import { env } from "../config/env";
import { ordersController } from "../controllers/orders-controller";
import { orderService } from "../services/order-service";

const authClient = new AuthClient(env.authServiceBaseUrl);
const verifyToken = securityMiddleware.createVerifyToken(authClient);



export const ordersRouter = express.Router();


// GET
ordersRouter.get("/", //get all orders
    verifyToken,
    securityMiddleware.verifyAdmin,
    ordersController.getAllOrders.bind(ordersController));

ordersRouter.get("/me",
    verifyToken,
    ordersController.getMyOrders.bind(ordersController));

ordersRouter.get("/:orderId/user/:userId", //get order with user
    verifyToken,
    securityMiddleware.verifyAdmin,
    ordersController.getOrderWithUser.bind(ordersController));

ordersRouter.get("/:_id", // get a specific order
    verifyToken,
    securityMiddleware.createVerifyOwnerOrAdmin(async (req) => {
        const order = await orderService.getOrderById(req.params._id! as string);
        return order.userId;
    }),
    ordersController.getOrderById.bind(ordersController));

ordersRouter.get("/product/:_id", // get a specific product from product-service
    ordersController.getProductById.bind(ordersController));


// POST
ordersRouter.post("/", //add an order
    verifyToken,
    ordersController.addOrder.bind(ordersController));

// PUT
ordersRouter.put("/:_id", //update order
    verifyToken,
    securityMiddleware.createVerifyOwnerOrAdmin(async (req) => {
        const order = await orderService.getOrderById(req.params._id! as string);
        return order.userId;
    }),
    ordersController.updateOrder.bind(ordersController));

// DELETE

ordersRouter.delete("/:_id", // delete a specific order
    verifyToken,
    securityMiddleware.createVerifyOwnerOrAdmin(async (req) => {
        const order = await orderService.getOrderById(req.params._id! as string);
        return order.userId;
    }),
    ordersController.deleteOrder.bind(ordersController));

ordersRouter.delete("/", // delete all orders
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    ordersController.deleteAll.bind(ordersController));