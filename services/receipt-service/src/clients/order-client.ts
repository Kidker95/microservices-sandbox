import mongoose from "mongoose";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "../models/errors";
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

    private async fetchWithTimeout(url: string, init: RequestInit = {}, ms = 5000): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);


        try { return await fetch(url, { ...init, signal: controller.signal }); }
        finally { clearTimeout(id); }
    }

    public async getOrderById(orderId: string, token?: string): Promise<RemoteOrder> {
        this.validateId(orderId);
        const init: RequestInit = token ? { headers: { Authorization: token } } : {};
        let response: Response;
        try {
            response = await this.fetchWithTimeout(`${this.orderServiceBaseUrl}/orders/${orderId}`, init);
        } catch (err) {
            throw Object.assign(
                new ServiceUnavailableError("Dependency unavailable: order-service"),
                {
                    service: "receipt-service",
                    dependency: "order-service",
                    details: err instanceof Error ? err.message : String(err)
                }
            );
        }
        return this.handleResponse(response, orderId);
    }

}

export const orderClient = new OrderClient();