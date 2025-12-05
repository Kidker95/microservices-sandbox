import express from "express";
import { ordersController } from "../controllers/orders-controller";


export const ordersRouter = express.Router();


// GET
ordersRouter.get("/", ordersController.getAllOrders.bind(ordersController));
ordersRouter.get("/:orderId/user/:userId", ordersController.getOrderWithUser.bind(ordersController));
ordersRouter.get("/:_id", ordersController.getOrderById.bind(ordersController));

// POST
ordersRouter.post("/", ordersController.addOrder.bind(ordersController));

// PUT
ordersRouter.put("/:_id", ordersController.updateOrder.bind(ordersController));

// DELETE

ordersRouter.delete("/:_id",ordersController.deleteOrder.bind(ordersController));
