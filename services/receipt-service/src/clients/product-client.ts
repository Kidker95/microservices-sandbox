import { StatusCode } from "@ms/common/enums";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "@ms/common/errors";
import { assertMongoObjectId, fetchWithTimeout } from "@ms/common/http";
import { RemoteProduct } from "@ms/common/types";
import { env } from "../config/env";

class ProductClient {

    private productServiceBaseUrl = env.productServiceBaseUrl;

    private async handleResponse(response: any, _id: string): Promise<RemoteProduct> {
        let data: any = null;

        try { data = await response.json(); } catch { data = null; }

        if (response.status === StatusCode.NotFound) {
            const message = data?.error || `product with _id ${_id} not found`;
            throw new NotFoundError(message);
        }

        if (!response.ok) {
            const message = data?.error || `product-service error: ${response.status} ${response.statusText}`;
            throw new BadRequestError(message);
        }

        return data as RemoteProduct;
    }

    // this is for single product
    public async getProductById(productId: string, token?: string): Promise<RemoteProduct> {
        assertMongoObjectId(productId, "productId");
        const init: RequestInit = token ? { headers: { Authorization: token } } : {};
        let response: Response;
        try {
            response = await fetchWithTimeout(`${this.productServiceBaseUrl}/products/${productId}`, init);

        } catch (err) {
           throw Object.assign(
                new ServiceUnavailableError("Dependency unavailable: product-service"),
                {
                    service: "receipt-service",
                    dependency: "product-service",
                    details: err instanceof Error ? err.message : String(err)
                }
            );
        }
        return this.handleResponse(response, productId);
    }

    // this is for multiple products
    public async getProductsByIdArr(productIds: string[], token?: string): Promise<RemoteProduct[]> {
        const results: RemoteProduct[] = [];

        for (const id of productIds) {
            try {
                const product = await this.getProductById(id, token);
                results.push(product);
            } catch (err) {
                if (err instanceof NotFoundError) {
                    console.warn(`Skipping missing product: ${id}`);
                    continue;
                }
                throw err;

            }
        }
        return results;
    }

}

export const productClient = new ProductClient();