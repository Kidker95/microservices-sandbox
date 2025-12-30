import { env } from "../config/env";
import { StatusCode } from "../models/enums";
import { BadRequestError, ForbiddenError, UnauthorizedError } from "../models/errors";
import { AuthContext } from "../models/types";

class AuthClient {

    private authServiceBaseUrl: string = env.authServiceBaseUrl;

    public async verifyToken(token: string): Promise<AuthContext> {
        if (!token) throw new UnauthorizedError("Missing token");

        const response = await fetch(`${this.authServiceBaseUrl}/api/auth/verify`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        let data: any = null;
        try { data = await response.json(); } catch { data = null; }

        if (response.status === StatusCode.Unauthorized) throw new UnauthorizedError(data?.error || "Invalid token");
        

        if (response.status === StatusCode.Forbidden) throw new ForbiddenError(data?.error || "Forbidden");
        

        if (!response.ok) throw new BadRequestError(data?.error || `auth-service error: ${response.status} ${response.statusText}`);
        

        return data as AuthContext;
    }

}

export const authClient = new AuthClient();
