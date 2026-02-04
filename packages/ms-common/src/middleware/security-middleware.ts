import { Request, Response, NextFunction, RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { UserRole } from "../enums";
import { AuthContext } from "../types";

type HasVerifyToken = {
    verifyToken: (token: string) => Promise<AuthContext>;
};

type VerifyTokenOptions = {
    cookieName?: string;          // e.g. "admin_token"
    allowCookieFallback?: boolean; // default false
};

declare global { namespace Express { interface Request { user?: AuthContext; } } }

const extractBearerToken = (req: Request): string | undefined => {
    const header = req.headers.authorization;
    if (!header) return undefined;

    const [scheme, token] = header.split(" ");
    if (!scheme || scheme.toLowerCase() !== "bearer") return undefined;

    return token?.trim() || undefined;
};

const extractCookieToken = (req: Request, cookieName: string): string | undefined => {
    const cookies = (req as any).cookies;
    if (!cookies) return undefined;
    const token = cookies[cookieName] as string | undefined;
    return token?.trim() || undefined;
};

const createVerifyToken = (authClient: HasVerifyToken, options?: VerifyTokenOptions): RequestHandler => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const headerToken = extractBearerToken(req);

            const cookieToken =
                options?.allowCookieFallback && options.cookieName
                    ? extractCookieToken(req, options.cookieName)
                    : undefined;

            const token =
                options?.allowCookieFallback && options.cookieName
                    ? (cookieToken || headerToken)
                    : (headerToken || cookieToken);
            if (!token) throw new UnauthorizedError("Missing token");

            req.user = await authClient.verifyToken(token);
            next();
        } catch (err) { next(err); }
    };
};

const verifyLoggedIn: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError("Not logged in");
    next();
};

const verifyAdmin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError("Not logged in");
    if (req.user.role !== UserRole.Admin) throw new ForbiddenError("Admin access required");
    next();
};

const createVerifyOwnerOrAdmin = (getOwnerIdFromReq: (req: Request) => string | Promise<string>): RequestHandler => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new UnauthorizedError("Not logged in");

            if (req.user.role === UserRole.Admin) {
                next();
                return;
            }

            const ownerId = await getOwnerIdFromReq(req);
            if (!ownerId) throw new UnauthorizedError("Missing owner id");

            if (req.user._id !== ownerId) throw new ForbiddenError("Owner or admin access required");

            next();
        } catch (err) { next(err); }
    };
};



export const securityMiddleware = {
    createVerifyToken,
    verifyLoggedIn,
    verifyAdmin,
    createVerifyOwnerOrAdmin
};