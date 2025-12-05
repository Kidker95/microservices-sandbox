import mongoose from "mongoose";
import { env } from "../config/env";
import { BadRequestError, NotFoundError } from "../models/errors";
import { RemoteUser } from "../models/types";

class UserClient {

    private baseUrl: string = env.userServiceBaseUrl; // e.g. http://localhost:4001/api

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid)  throw new BadRequestError(`_id ${_id} is invalid`);
        
    }

    public async getUserById(_id: string): Promise<RemoteUser> {
        this.validateId(_id);

        const response = await fetch(`${this.baseUrl}/users/${_id}`);
        if(response.status === 404) throw new NotFoundError(`user with id ${_id} not found`);

        if(!response.ok) throw new Error(`user-service error: ${response.status} ${response.statusText}`);

        return await response.json() as RemoteUser;
        
        
    }

}

export const userClient = new UserClient();