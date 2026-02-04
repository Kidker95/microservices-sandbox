import { StatusCode } from "@ms/common/enums";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "@ms/common/errors";
import { assertMongoObjectId, fetchWithTimeout } from "@ms/common/http";
import { RemoteUser } from "@ms/common/types";
import { env } from "../config/env";


class UserClient {
    private readonly baseUrl = env.userServiceBaseUrl;

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
        assertMongoObjectId(userId);
        const init: RequestInit = token ? { headers: { Authorization: token } } : {};

        let response: Response;
        try {
            response = await fetchWithTimeout(`${this.baseUrl}/users/${userId}`, init);
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