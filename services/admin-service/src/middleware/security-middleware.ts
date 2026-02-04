import { AuthClient } from "@ms/common/clients";
import { env } from "../config/env";
import { securityMiddleware } from "@ms/common/middleware";

const authClient = new AuthClient(env.authServiceBaseUrl);

export const verifyToken = securityMiddleware.createVerifyToken(authClient, {
    cookieName: "admin_token",
    allowCookieFallback: true
});

export const verifyLoggedIn = securityMiddleware.verifyLoggedIn;
export const verifyAdmin = securityMiddleware.verifyAdmin;
