import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../models/enums";
import { authService } from "../services/auth-service";
import { CredentialsModel, RegisterUserPayload } from "../models/types";

class AuthController {

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = req.body as RegisterUserPayload;

            if (!payload.email || !payload.password || !payload.name || !payload.address) {
                return res.status(StatusCode.BadRequest).json({ error: "Missing required fields: email, password, name, address" });
            }

            const token = await authService.register(payload);
            return res.status(StatusCode.Created).json({ token });
        } catch (err) { next(err); }
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = req.body as CredentialsModel;

            if (!credentials.email || !credentials.password) {
                return res.status(StatusCode.BadRequest).json({ error: "Missing email or password" });
            }

            const token = await authService.login(credentials);
            return res.status(StatusCode.OK).json({ token });
        } catch (err) {next(err);}
    }

    public async logout(_req: Request, res: Response, next: NextFunction) {
        try {
            return res.sendStatus(StatusCode.NoContent);
        } catch (err) {next(err);}
    }
}

export const authController = new AuthController();
