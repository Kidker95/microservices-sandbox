import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../models/errors";
import { env } from "../config/env";
import { RemoteUser } from "../models/types";

class UserClient{
    private baseUrl = env.userServiceBaseUrl;

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
    }

    // Shared response handler – reads body ONLY ONCE
    private async handleResponse(response: any, _id: string): Promise<RemoteUser> {
        let data: any = null;

        try { data = await response.json(); } catch { data = null; }

        if (response.status === 404) {
            const message = data?.error || `user with _id ${_id} not found`;
            throw new NotFoundError(message);
        }

        if (!response.ok) {
            const message = data?.error || `user-service error: ${response.status} ${response.statusText}`;
            throw new BadRequestError(message);
        }

        return data as RemoteUser;
    }

    public async getUserById(userId:string): Promise<RemoteUser>{
        this.validateId(userId);

        const response = await fetch(`${this.baseUrl}/users/${userId}`);
        return this.handleResponse(response,userId);
    }

}

export const userClient = new UserClient();