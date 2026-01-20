import mongoose from "mongoose";
import { StatusCode } from "../models/enums";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "../models/errors";
import { RemoteUser } from "../models/types";
import { env } from "../config/env";

class UserClient {

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

    private throwUserServiceDown(err: unknown): never {
        throw Object.assign(
            new ServiceUnavailableError("Dependency unavailable: user-service"),
            {
                service: "auth-service",
                dependency: "user-service",
                details: err instanceof Error ? err.message : String(err)
            }
        );
    }


    private async handleResponse<T>(response: Response, notFoundMessage: string): Promise<T> {
        let data: any = null;

        try { data = await response.json(); } catch { data = null; }

        if (response.status === StatusCode.NotFound) {
            const message = data?.error || notFoundMessage;
            throw new NotFoundError(message);
        }

        if (!response.ok) {
            const message = data?.error || `user-service error: ${response.status} ${response.statusText}`;
            throw new BadRequestError(message);
        }

        return data as T;
    }

    public async getUserByEmail(email: string): Promise<RemoteUser | null> {
        if (!email) throw new BadRequestError("Missing email");

        const url = `${env.userServiceBaseUrl}/api/users/by-email/${encodeURIComponent(email)}`;

        let response: Response;
        try { response = await this.fetchWithTimeout(url, { method: "GET" }, 5000); }
        catch (err) { this.throwUserServiceDown(err); }

        if (response.status === StatusCode.NotFound) return null;

        return this.handleResponse<RemoteUser>(response, `user with email ${email} not found`);

    }

    public async getUserById(_id: string): Promise<RemoteUser> {
        this.validateId(_id);
        const url = `${env.userServiceBaseUrl}/api/users/${_id}`;
        let response: Response;
        try { response = await this.fetchWithTimeout(url, { method: "GET" }, 5000); }
        catch (err) { this.throwUserServiceDown(err); }

        return this.handleResponse<RemoteUser>(response, `user with _id ${_id} not found`);
    }

    public async createUser(input: { email: string; name: string; address: any }): Promise<RemoteUser> {
        const url = `${env.userServiceBaseUrl}/api/users`;

        let response: Response;
        try {
            response = await this.fetchWithTimeout(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input)
            }, 5000);
        } catch (err) { this.throwUserServiceDown(err); }

        return this.handleResponse<RemoteUser>(response, "Failed creating user in user-service");
    }

}

export const userClient = new UserClient();
