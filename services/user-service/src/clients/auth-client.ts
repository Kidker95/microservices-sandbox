import { env } from "../config/env";
import { StatusCode } from "../models/enums";
import { BadRequestError, ForbiddenError, ServiceUnavailableError, UnauthorizedError } from "../models/errors";
import { AuthContext } from "../models/types";

class AuthClient {

    private authServiceBaseUrl: string = env.authServiceBaseUrl;

    private async fetchWithTimeout(url: string, init: RequestInit = {}, ms = 5000): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);

        try { return await fetch(url, { ...init, signal: controller.signal }); }
        finally { clearTimeout(id); }
    }

    public async verifyToken(token: string): Promise<AuthContext> {
        if (!token) throw new UnauthorizedError("Missing token");

        let response: Response;
        try {
            response = await this.fetchWithTimeout(`${this.authServiceBaseUrl}/api/auth/verify`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            }, 5000);
        } catch (err) {
            throw Object.assign(
                new ServiceUnavailableError("Dependency unavailable: auth-service"),
                {
                    service: "user-service",
                    dependency: "auth-service",
                    details: err instanceof Error ? err.message : String(err)
                }
            );
        }

        let data: any = null;
        try { data = await response.json(); } catch { data = null; }

        if (response.status === StatusCode.Unauthorized) throw new UnauthorizedError(data?.error || "Invalid token");


        if (response.status === StatusCode.Forbidden) throw new ForbiddenError(data?.error || "Forbidden");


        if (!response.ok) throw new BadRequestError(data?.error || `auth-service error: ${response.status} ${response.statusText}`);


        return data as AuthContext;
    }
}

export const authClient = new AuthClient();
