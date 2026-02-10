import { StatusCode } from "@ms/common/enums";
import { BadRequestError, ServiceUnavailableError } from "@ms/common/errors";
import { fetchWithTimeout } from "@ms/common/http";
import { RemoteUser } from "@ms/common/types";
import { env } from "../config/env";

class UsersClient {
    private readonly baseUrl = env.userServiceBaseUrl;

    public async getUserById(userId: string, token: string): Promise<RemoteUser | null> {
        try {
            const res = await fetchWithTimeout(`${this.baseUrl}/api/users/${userId}`, {
                headers: { Authorization: token }
            });
            const data = await res.json().catch(() => null);

            if (res.status === StatusCode.NotFound) return null;

            if (!res.ok) {
                const message = data?.error || `user-service error: ${res.status} ${res.statusText}`;
                if (res.status === StatusCode.Unauthorized || res.status === StatusCode.Forbidden) {
                    throw new BadRequestError(message);
                }
                throw new ServiceUnavailableError(message);
            }

            return data as RemoteUser;
        } catch (err: any) {
            if (err instanceof BadRequestError || err instanceof ServiceUnavailableError) throw err;
            throw new ServiceUnavailableError(err?.message || "Dependency unavailable: user-service");
        }
    }
}

export const usersClient = new UsersClient();
