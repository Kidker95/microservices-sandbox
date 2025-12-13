import mongoose from "mongoose";

import { BadRequestError, NotFoundError } from "../models/errors";
import { RemoteProduct } from "../models/types";
import { StatusCode } from "../models/enums";
import { env } from "../config/env";

class ProductClient {

    private productServiceBaseUrl = env.productServiceBaseUrl;

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
    }

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
    public async getProductById(productId: string): Promise<RemoteProduct> {
        this.validateId(productId);
        let response: any;
        try {
            response = await fetch(`${this.productServiceBaseUrl}/products/${productId}`);

        } catch {
            throw new BadRequestError(`product-service is unreachable`);
        }
        return this.handleResponse(response, productId);
    }

    // this is for multiple products
    public async getProductsByIdArr(productIds: string[]): Promise<RemoteProduct[]> {
        const results: RemoteProduct[] = [];

        for (const id of productIds) {
            try {
                const product = await this.getProductById(id);
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