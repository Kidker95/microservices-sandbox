import { StatusCode } from "@ms/common/enums";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "@ms/common/errors";
import { RemoteOrder } from "@ms/common/types";
import { env } from "../config/env";
import { assertMongoObjectId, fetchWithTimeout } from "@ms/common/http";


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

    

    public async getOrderById(orderId: string, token?: string): Promise<RemoteOrder> {
        assertMongoObjectId(orderId, "orderId");
        const init: RequestInit = token ? { headers: { Authorization: token } } : {};
        let response: Response;
        try {
            response = await fetchWithTimeout(`${this.orderServiceBaseUrl}/orders/${orderId}`, init);
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