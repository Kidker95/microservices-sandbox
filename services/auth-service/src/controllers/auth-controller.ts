import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../models/enums";
import { CredentialsInput, RegisterInput } from "../models/types";
import { authService } from "../services/auth-service";

class AuthController {

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const input = req.body as RegisterInput;
    
            if (!input.email || !input.password || !input.name || !input.address) {
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
            return res.status(StatusCode.OK).json({ token });
        }
        catch (err) { next(err); }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        try {
            await authService.logout();
            return res.status(StatusCode.OK).json({ ok: true });
        }
        catch (err) { next(err); }
    }

    public async verify(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? 
        authHeader.slice(7).trim() : "";

        const context = authService.verifyToken(token);
        return res.status(StatusCode.OK).json(context);
    }

}

export const authController = new AuthController();