import express from "express";
import { authController } from "../controllers/auth-controller";

export const authRouter = express.Router();

// POST /api/auth/register
authRouter.post("/register", authController.register.bind(authController));

// POST /api/auth/login
authRouter.post("/login", authController.login.bind(authController));

// POST /api/auth/logout
authRouter.post("/logout", authController.logout.bind(authController));
