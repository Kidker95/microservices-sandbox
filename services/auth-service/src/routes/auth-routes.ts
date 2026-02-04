import express from "express";
import { authController } from "../controllers/auth-controller";
import { securityMiddleware } from "@ms/common/middleware";
import { authService } from "../services/auth-service";

export const authRouter = express.Router();

const verifyToken = securityMiddleware.createVerifyToken({
    verifyToken: authService.verifyToken.bind(authService)
});

authRouter.post("/register", authController.register.bind(authController));
authRouter.post("/login", authController.login.bind(authController));
authRouter.post("/logout", authController.logout.bind(authController));

authRouter.delete("/seed-wipe", verifyToken,
    securityMiddleware.verifyAdmin,
    authController.seedWipe.bind(authController));


authRouter.get("/verify", verifyToken,
    authController.verify.bind(authController));
