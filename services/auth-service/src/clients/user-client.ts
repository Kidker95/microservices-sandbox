import mongoose from "mongoose";
import { StatusCode } from "../models/enums";
import { BadRequestError, NotFoundError } from "../models/errors";
import { RemoteUser } from "../models/types";
import { env } from "../config/env";

class UserClient {

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
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
        const response = await fetch(url);

        // Special case: return null instead of throwing NotFound
        if (response.status === StatusCode.NotFound) return null;

        return this.handleResponse<RemoteUser>(response, `user with email ${email} not found`);
    }

    public async getUserById(_id: string): Promise<RemoteUser> {
        this.validateId(_id);

        const url = `${env.userServiceBaseUrl}/api/users/${_id}`;
        const response = await fetch(url);

        return this.handleResponse<RemoteUser>(response, `user with _id ${_id} not found`);
    }

    public async createUser(input: { email: string; name: string; address: any }): Promise<RemoteUser> {
        const url = `${env.userServiceBaseUrl}/api/users`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input)
        });
    
        return this.handleResponse<RemoteUser>(response, "Failed creating user in user-service");
    }
    



}

export const userClient = new UserClient();
