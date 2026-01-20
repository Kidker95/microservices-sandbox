import mongoose from "mongoose";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "../models/errors";
import { env } from "../config/env";
import { RemoteUser } from "../models/types";
import { StatusCode } from "../models/enums";

class UserClient {
    private readonly baseUrl = env.userServiceBaseUrl;

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

    // Shared response handler – reads body ONLY ONCE
    private async handleResponse(response: any, _id: string): Promise<RemoteUser> {
        let data: any = null;

        try { data = await response.json(); } catch { data = null; }

        if (response.status === StatusCode.NotFound) {
            const message = data?.error || `user with _id ${_id} not found`;
            throw new NotFoundError(message);
        }

        if (!response.ok) {
            const message = data?.error || `user-service error: ${response.status} ${response.statusText}`;
            throw new BadRequestError(message);
        }

        return data as RemoteUser;
    }

    public async getUserById(userId: string, token?: string): Promise<RemoteUser> {
        this.validateId(userId);
        const init: RequestInit = token ? { headers: { Authorization: token } } : {};

        let response: Response;
        try {
            response = await this.fetchWithTimeout(`${this.baseUrl}/users/${userId}`, init);
        } catch (err) {
            throw Object.assign(
                new ServiceUnavailableError("Dependency unavailable: user-service"),
                {
                    service: "receipt-service",
                    dependency: "user-service",
                    details: err instanceof Error ? err.message : String(err)
                }
            );
        }
        return this.handleResponse(response, userId);
    }

}

export const userClient = new UserClient();