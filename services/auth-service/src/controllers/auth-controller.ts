import { NextFunction, Request, Response } from "express";
import { StatusCode } from "@ms/common/enums"
import { ForbiddenError } from "@ms/common/errors";
import { CredentialsInput, RegisterInput } from "../models/types";
import { authService } from "../services/auth-service";
import { env } from "../config/env";

class AuthController {

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const input = req.body as RegisterInput;

            if (input.userId) {
                if (!input.email || !input.password || !input.userId) {
                    return res.status(StatusCode.BadRequest).json({
                        error: "Missing required fields: email, password, userId"
                    });
                }
            } else if (!input.email || !input.password || !input.name || !input.address) {
                return res.status(StatusCode.BadRequest).json({
                    error: "Missing required fields: email, password, name, address"
                });
            }
    
            const token = await authService.register(input);
            return res.status(StatusCode.Created).json({ token });
        } catch (err) { next(err); }
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = req.body as CredentialsInput;

            if (!credentials.email || !credentials.password) {
                return res
                    .status(StatusCode.BadRequest)
                    .json({ error: "Missing required fields: email, password" });
            }

            const token = await authService.login(credentials);
            return res.status(StatusCode.Ok).json({ token });
        }
        catch (err) { next(err); }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        try {
            await authService.logout();
            return res.status(StatusCode.Ok).json({ ok: true });
        }
        catch (err) { next(err); }
    }

    public async verify(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ") ?
                authHeader.slice(7).trim() : "";

            const context = await authService.verifyToken(token);
            return res.status(StatusCode.Ok).json(context);
        } catch (err) { next(err); }
    }

    public async seedWipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (env.environment === "production") throw new ForbiddenError("Seed wipe is disabled in production");
            if (req.header("x-seed-wipe") !== "true") throw new ForbiddenError("Seed wipe header missing");
            const deleteCount = await authService.deleteAllExceptEmail(env.seedRootAdminEmail);
            return res.status(StatusCode.Ok).json({ deleted: deleteCount });
        } catch (err) { next(err); }
    }

}

export const authController = new AuthController();
