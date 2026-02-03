import { UserRole } from "@ms/common/enums";
import { ForbiddenError, UnauthorizedError } from "@ms/common/errors";
import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth-service";


class SecurityMiddleware {

    public async verifyLoggedIn(req: Request, _res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7).trim()
                : "";

            if (!token) throw new UnauthorizedError("Missing token");

            const authContext = await authService.verifyToken(token);

            (req as any).user = authContext;

            next();
        } catch (err) { next(err); }
    }

    public async verifyAdmin(req: Request, _res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (!user) throw new UnauthorizedError("Not logged in");
            if (user.role !== UserRole.Admin) throw new ForbiddenError("Admin only");
            next();
        } catch (err) { next(err); }
    }
}

export const securityMiddleware = new SecurityMiddleware();
