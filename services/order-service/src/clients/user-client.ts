import { StatusCode } from "@ms/common/enums";
import { NotFoundError } from "@ms/common/errors";
import { assertMongoObjectId, fetchWithTimeout } from "@ms/common/http";
import { RemoteUser } from "@ms/common/types";
import { env } from "../config/env";

class UserClient {

    private baseUrl: string = env.userServiceBaseUrl; 

    

    public async getUserById(_id: string, token?: string): Promise<RemoteUser> {
        assertMongoObjectId(_id,"_id");

        const url = `${this.baseUrl}/users/${_id}`;
        const init: RequestInit = token ? { headers: { Authorization: token } } : {};

        let response: Response;
        try {
            response = await fetchWithTimeout(url, init, 5000);
        } catch (err: any) {
            throw new Error(`user-service unreachable or timed out: ${err?.name || err}`);
        }

        if (response.status === StatusCode.NotFound) throw new NotFoundError(`user with id ${_id} not found`);
        if (!response.ok) throw new Error(`user-service error: ${response.status} ${response.statusText}`);

        return await response.json() as RemoteUser;
    }



}

export const userClient = new UserClient();