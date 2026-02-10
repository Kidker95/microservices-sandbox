import { StatusCode } from "@ms/common/enums";
import { BadRequestError, ServiceUnavailableError } from "@ms/common/errors";
import { fetchWithTimeout } from "@ms/common/http";
import { RemoteOrder } from "@ms/common/types";
import { env } from "../config/env";

class OrdersClient {
    private readonly baseUrl = env.orderServiceBaseUrl;

    public async getAllOrders(token: string): Promise<RemoteOrder[]> {
        try {
            const res = await fetchWithTimeout(`${this.baseUrl}/api/orders`, {
                headers: { Authorization: token }
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const message = data?.error || `order-service error: ${res.status} ${res.statusText}`;
                if (res.status === StatusCode.Unauthorized || res.status === StatusCode.Forbidden) {
                    throw new BadRequestError(message);
                }
                throw new ServiceUnavailableError(message);
            }

            if (!Array.isArray(data)) return [];
            return data as RemoteOrder[];
        } catch (err: any) {
            if (err instanceof BadRequestError || err instanceof ServiceUnavailableError) throw err;
            throw new ServiceUnavailableError(err?.message || "Dependency unavailable: order-service");
        }
    }
}

export const ordersClient = new OrdersClient();
