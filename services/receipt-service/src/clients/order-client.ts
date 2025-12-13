import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../models/errors";
import { env } from "../config/env";
import { RemoteOrder } from "../models/types";
import { StatusCode } from "../models/enums";

class OrderClient {

    private orderServiceBaseUrl: string = env.orderServiceBaseUrl;

    private async handleResponse(response: any, _id: string): Promise<RemoteOrder> {
        let data: any = null;

        try { data = await response.json(); } catch { data = null; }

        if (response.status === StatusCode.NotFound) {
            const message = data?.error || `order with _id ${_id} not found`;
            throw new NotFoundError(message);
        }

        if (!response.ok) {
            const message = data?.error || `order-service error: ${response.status} ${response.statusText}`;
            throw new BadRequestError(message);
        }

        return data as RemoteOrder;
    }

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
    }
    
    public async getOrderById(orderId:string): Promise<RemoteOrder>{
        this.validateId(orderId);
        const response = await fetch(`${this.orderServiceBaseUrl}/orders/${orderId}`);
        return this.handleResponse(response,orderId);
    }

}

export const orderClient = new OrderClient();