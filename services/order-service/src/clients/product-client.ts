import { env } from "../config/env";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "@ms/common/errors";
import { RemoteProduct } from "@ms/common/types";
import { fetchWithTimeout, assertMongoObjectId } from "@ms/common/http";


class ProductClient {

    private baseUrl = env.productServiceBaseUrl;


    private throwUnavailable(err: unknown): never {
        throw Object.assign(
            new ServiceUnavailableError("Dependency unavailable: product-service"),
            {
                service: "order-service",
                dependency: "product-service",
                details: err instanceof Error ? err.message : String(err)
            }
        );
    }

    // Shared response handler – reads body ONLY ONCE
    private async handleResponse(response: any, _id: string): Promise<RemoteProduct> {
        let data: any = null;

        try { data = await response.json(); } catch { data = null; }

        if (response.status === 404) {
            const message = data?.error || `product with _id ${_id} not found`;
            throw new NotFoundError(message);
        }

        if (!response.ok) {
            const message = data?.error || `product-service error: ${response.status} ${response.statusText}`;
            throw new BadRequestError(message);
        }

        return data as RemoteProduct;
    }

    public async getProductById(_id: string, token?: string): Promise<RemoteProduct> {
        assertMongoObjectId(_id,"_id");

        const url = `${this.baseUrl}/products/${_id}`;
        const init: RequestInit = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        let response: Response;

        try {response = await fetchWithTimeout(url, init, 5000);}
        catch (err) { this.throwUnavailable(err); }

        return this.handleResponse(response, _id);
    }

    public async adjustStock(_id: string, delta: number, token?: string): Promise<RemoteProduct> {
        assertMongoObjectId(_id,"_id");
        let response: Response;

        try {
            response = await fetchWithTimeout(`${this.baseUrl}/products/${_id}/stock`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ delta })
            }, 5000);
        } catch (err) { this.throwUnavailable(err); }

        return this.handleResponse(response, _id);
    }
}

export const productClient = new ProductClient();
