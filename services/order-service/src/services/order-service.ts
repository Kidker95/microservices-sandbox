import mongoose from "mongoose";
import { userClient } from "../clients/user-client";
import { BadRequestError, NotFoundError } from "../models/errors";
import { OrderDocument, OrderModel } from "../models/order-model";
import { Order, RemoteUser } from "../models/types";

class OrderService {

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
    }

    public async getAllOrders(): Promise<OrderDocument[]> { return await OrderModel.find().exec(); }

    public async getOrderById(_id: string): Promise<OrderDocument> {
        this.validateId(_id);

        const order = await OrderModel.findById(_id).exec();
        if (!order) throw new NotFoundError(`Order with id ${_id} was not found`);
        return order;
    }

    public async addOrder(order: Omit<Order, "_id" | "createdAt" | "updatedAt">): Promise<OrderDocument> {
        const orderDoc = new OrderModel(order); // creating new mongo doc
        BadRequestError.validateSync(orderDoc); //validating
        await orderDoc.save();
        const dbOrder = await this.getOrderById(orderDoc._id.toString());
        return dbOrder; // return the actual order from the db
    }

    public async updateOrder(_id: string, order: Partial<Omit<Order, "_id" | "createdAt" | "updatedAt">>): Promise<OrderDocument> {
        this.validateId(_id);

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            _id,
            order,
            { new: true, runValidators: true }
        ).exec();

        if (!updatedOrder) throw new NotFoundError(`Order with id ${_id} not found`);
        return updatedOrder;
    }

    public async deleteOrder(_id: string): Promise<void> {
        this.validateId(_id);
        const deleted = await OrderModel.findByIdAndDelete(_id);
        if (!deleted) throw new NotFoundError(`Order with id ${_id} not found`);

    }


    // talk to the other backend

    public async getOrderWithUser(orderId: string, userId: string): Promise<{ order: OrderDocument; user: RemoteUser }> {
        this.validateId(userId);
        this.validateId(orderId);

        const order = await this.getOrderById(orderId);
        const user = await userClient.getUserById(userId);

        return { order, user };
    }
}

export const orderService = new OrderService();