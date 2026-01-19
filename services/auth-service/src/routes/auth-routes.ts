import express from "express";
import { authController } from "../controllers/auth-controller";
import { securityMiddleware } from "../middleware/security-middleware";

export const authRouter = express.Router();

authRouter.post("/register", authController.register.bind(authController));
authRouter.post("/login", authController.login.bind(authController));
authRouter.post("/logout", authController.logout.bind(authController));

authRouter.delete("/seed-wipe",
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    authController.seedWipe.bind(authController));


authRouter.get("/verify",
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    authController.verify.bind(authController));
