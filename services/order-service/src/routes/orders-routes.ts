import express from "express";
import { ordersController } from "../controllers/orders-controller";
import { securityMiddleware } from "../middleware/security-middleware";


export const ordersRouter = express.Router();


// GET
ordersRouter.get("/", //get all orders
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    ordersController.getAllOrders.bind(ordersController));

ordersRouter.get("/:orderId/user/:userId", //get order with user
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    ordersController.getOrderWithUser.bind(ordersController));

ordersRouter.get("/:_id", // get a specific order
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyOwnerOrAdmin.bind(securityMiddleware),
    ordersController.getOrderById.bind(ordersController));

ordersRouter.get("/product/:_id", // get a specific product from product-service
    ordersController.getProductById.bind(ordersController));


// POST
ordersRouter.post("/", //add an order
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    ordersController.addOrder.bind(ordersController));

// PUT
ordersRouter.put("/:_id", //update order
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyOwnerOrAdmin.bind(securityMiddleware),
    ordersController.updateOrder.bind(ordersController));

// DELETE

ordersRouter.delete("/:_id", // delete a specific order
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyOwnerOrAdmin.bind(securityMiddleware),
    ordersController.deleteOrder.bind(ordersController));

ordersRouter.delete("/", // delete all orders
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    ordersController.deleteAll.bind(ordersController));