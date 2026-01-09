import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../models/errors";
import { env } from "../config/env";
import { RemoteProduct } from "../models/types";

class ProductClient {

    private baseUrl = env.productServiceBaseUrl;

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
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
        this.validateId(_id);

        const init: RequestInit = token ? { headers: { Authorization: token } } : {};
        const response = await fetch(`${this.baseUrl}/products/${_id}`, init);

        return this.handleResponse(response, _id);
    }

    public async adjustStock(_id: string, delta: number, token?: string): Promise<RemoteProduct> {
        this.validateId(_id);

        const response = await fetch(`${this.baseUrl}/products/${_id}/stock`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: token } : {})
            },

            body: JSON.stringify({ delta })
        });

        return this.handleResponse(response, _id);
    }
}

export const productClient = new ProductClient();
