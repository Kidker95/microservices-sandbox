import express from "express";
import { authController } from "../controllers/auth-controller";

export const authRouter = express.Router();

authRouter.post("/register", authController.register.bind(authController));
authRouter.post("/login", authController.login.bind(authController));
authRouter.post("/logout", authController.logout.bind(authController));


authRouter.get("/verify", authController.verify.bind(authController));
