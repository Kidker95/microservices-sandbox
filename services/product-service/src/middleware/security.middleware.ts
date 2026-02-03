import { NextFunction, Request, Response } from "express";
import { UnauthorizedError, ForbiddenError } from "@ms/common/errors";
import { AuthClient } from "@ms/common/clients";
import { UserRole } from "@ms/common/enums";
import { AuthContext } from "@ms/common/types";
import { env } from "../config/env";

const baseUrl = env.authServiceBaseUrl;
if (!baseUrl) throw new Error("Missing AUTH_SERVICE_BASE_URL");

const authClient = new AuthClient(baseUrl);

interface AuthenticatedRequest extends Request {
    user?: AuthContext;
}

class SecurityMiddleware {

    public async verifyLoggedIn(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7).trim()
                : "";

            if (!token) throw new UnauthorizedError("Missing token");

            const authContext = await authClient.verifyToken(token);

            req.user = authContext;

            next();
        } catch (err) { next(err); }
    }

    public async verifyAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) throw new UnauthorizedError("Not logged in");
            if (user.role !== UserRole.Admin) throw new ForbiddenError("Admin only");
            next();
        } catch (err) { next(err); }
    }

    public verifyOwnerOrAdmin(getOwnerId: (req: Request) => string | Promise<string>) {
        return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
            try {
                const user = req.user;

                if (!user) throw new UnauthorizedError("Not logged in");
                if (user.role === UserRole.Admin) return next();

                const ownerId = await Promise.resolve(getOwnerId(req));
                if (!ownerId) throw new ForbiddenError("Forbidden");

                if (user._id !== ownerId) throw new ForbiddenError("Forbidden");

                next();
            } catch (err) { next(err); }
        };
    }


}

export const securityMiddleware = new SecurityMiddleware();