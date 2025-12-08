import mongoose from "mongoose";
import { userClient } from "../clients/user-client";
import { BadRequestError, NotFoundError } from "../models/errors";
import { OrderDocument, OrderModel } from "../models/order-model";
import { CreateOrderDto, Order, OrderItem, RemoteProduct, RemoteUser } from "../models/types";
import { productClient } from "../clients/product-client";
import { OrderStatus } from "../models/enums";

class OrderService {

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
    }

    public async getAllOrders(): Promise<OrderDocument[]> { return await OrderModel.find().exec(); }

    public async getOrderById(_id: string): Promise<OrderDocument> {
        this.validateId(_id);

        const order = await OrderModel.findById(_id).exec();
        if (!order) throw new NotFoundError(`Order with _id ${_id} was not found`);
        return order;
    }

    public async addOrder(order: CreateOrderDto): Promise<OrderDocument> {

        if (!order.items || order.items.length === 0) throw new BadRequestError("Order must contain at least one item");
        
    
        // 1. validate user exists
        await userClient.getUserById(order.userId);
    
        const items: OrderItem[] = [];
        let subtotal = 0;
    
        // 2. build items + subtotal
        for (const item of order.items) {
            const product = await productClient.getProductById(item.productId);
            if (!product.isActive) throw new BadRequestError(`product ${product.name} is inactive`);
            
    
            const unitPrice = product.price;
            subtotal += unitPrice * item.quantity;
    
            const orderItem = {
                productId: product._id,
                sku: product.sku,
                name: product.name,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                unitPrice,
                currency: product.currency
            };
    
            items.push(orderItem as OrderItem);
        }
    
        const shippingCost = 0; // for now
        const total = subtotal + shippingCost;
    
        // 3. create the order document with all the fields
        const orderDoc = new OrderModel({
            userId: order.userId,
            items,
            status: OrderStatus.Pending,
            subtotal,
            shippingCost,
            total,
            shippingAddress: order.shippingAddress
        });
    
        BadRequestError.validateSync(orderDoc);
        await orderDoc.save();
    
        // 4. after saving, update stock in product-service
        for (const item of order.items) await productClient.adjustStock(item.productId, -item.quantity);
        
    
        return this.getOrderById(orderDoc._id.toString());
    }
    
    public async updateOrder(_id: string, order: Partial<Omit<Order, "_id" | "createdAt" | "updatedAt">>): Promise<OrderDocument> {
        this.validateId(_id);

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            _id,
            order,
            { new: true, runValidators: true }
        ).exec();

        if (!updatedOrder) throw new NotFoundError(`Order with _id ${_id} not found`);
        return updatedOrder;
    }

    public async deleteOrder(_id: string): Promise<void> {
        this.validateId(_id);
        const deleted = await OrderModel.findByIdAndDelete(_id);
        if (!deleted) throw new NotFoundError(`Order with id ${_id} not found`);

    }

    // talk to user-service

    public async getOrderWithUser(orderId: string, userId: string): Promise<{ order: OrderDocument; user: RemoteUser }> {
        this.validateId(userId);
        this.validateId(orderId);

        const order = await this.getOrderById(orderId);
        const user = await userClient.getUserById(userId);

        return { order, user };
    }

    // talk to product-service

    public async getProductById(_id: string): Promise<RemoteProduct> {
        this.validateId(_id);
        const product = await productClient.getProductById(_id);
        if (!product.isActive) throw new Error(`product ${product.name} is inactive`);
        return product;
    }
}

export const orderService = new OrderService();