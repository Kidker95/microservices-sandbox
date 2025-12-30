import { NextFunction, Request, Response } from "express";
import { UnauthorizedError, ForbiddenError } from "../models/errors";
import { UserRole } from "../models/enums";
import { authClient } from "../clients/auth-client";

class SecurityMiddleware {

    public async verifyLoggedIn(req: Request, _res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7).trim()
                : "";

            if (!token) throw new UnauthorizedError("Missing token");

            const authContext = await authClient.verifyToken(token);

            (req as any).user = authContext;

            next();
        } catch (err) { next(err); }
    }

    public async verifyAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (!user) throw new UnauthorizedError("Not logged in");
            if (user.role !== UserRole.Admin) throw new ForbiddenError("Admin only");
            next();
        } catch (err) { next(err); }
    }

    public verifyOwnerOrAdmin(getOwnerId: (req: Request) => string | Promise<string>) {
        return async (req: Request, _res: Response, next: NextFunction) => {
            try {
                const user = (req as any).user;

                if (!user) throw new UnauthorizedError("Not logged in");
                if (user.role === UserRole.Admin) return next();

                const ownerId = await Promise.resolve(getOwnerId(req));
                if (!ownerId) throw new ForbiddenError("Forbidden");

                if (user.userId !== ownerId) throw new ForbiddenError("Forbidden");

                next();
            } catch (err) { next(err); }
        };
    }


}

export const securityMiddleware = new SecurityMiddleware();