import { StatusCode } from "@ms/common/enums";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "@ms/common/errors";
import { RemoteUser } from "@ms/common/types";
import mongoose from "mongoose";
import { env } from "../config/env";
import {fetchWithTimeout} from "@ms/common/http";
import {assertMongoObjectId} from "@ms/common/http";

class UserClient {

    

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
        try { response = await fetchWithTimeout(url, { method: "GET" }, 5000); }
        catch (err) { this.throwUserServiceDown(err); }

        if (response.status === StatusCode.NotFound) return null;

        return this.handleResponse<RemoteUser>(response, `user with email ${email} not found`);

    }

    public async getUserById(_id: string): Promise<RemoteUser> {
        assertMongoObjectId(_id, "_id");
        const url = `${env.userServiceBaseUrl}/api/users/${_id}`;
        let response: Response;
        try { response = await fetchWithTimeout(url, { method: "GET" }, 5000); }
        catch (err) { this.throwUserServiceDown(err); }

        return this.handleResponse<RemoteUser>(response, `user with _id ${_id} not found`);
    }

    public async createUser(input: { email: string; name: string; address: any }): Promise<RemoteUser> {
        const url = `${env.userServiceBaseUrl}/api/users`;

        let response: Response;
        try {
            response = await fetchWithTimeout(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input)
            }, 5000);
        } catch (err) { this.throwUserServiceDown(err); }

        return this.handleResponse<RemoteUser>(response, "Failed creating user in user-service");
    }

}

export const userClient = new UserClient();
