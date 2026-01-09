import mongoose from "mongoose";
import { env } from "../config/env";
import { BadRequestError, NotFoundError } from "../models/errors";
import { RemoteUser } from "../models/types";

class UserClient {

    private baseUrl: string = env.userServiceBaseUrl; // e.g. http://localhost:4001/api

    private async fetchWithTimeout(url: string, init: RequestInit = {}, ms = 5000): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ms);
    
        try {return await fetch(url, { ...init, signal: controller.signal });} 
        finally {clearTimeout(timeoutId);}
    }
    

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);

    }

    public async getUserById(_id: string, token?: string): Promise<RemoteUser> {
        this.validateId(_id);
    
        const url = `${this.baseUrl}/users/${_id}`;    
        const init: RequestInit = token ? { headers: { Authorization: token } } : {};
    
        let response: Response;
        try {
            response = await this.fetchWithTimeout(url, init, 5000);
        } catch (err: any) {
            throw new Error(`user-service unreachable or timed out: ${err?.name || err}`);
        }
    
        if (response.status === 404) throw new NotFoundError(`user with id ${_id} not found`);
        if (!response.ok) throw new Error(`user-service error: ${response.status} ${response.statusText}`);
    
        return await response.json() as RemoteUser;
    }
    


}

export const userClient = new UserClient();