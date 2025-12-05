import crypto from "crypto";
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from "../config/env";
import { UserRole } from '../models/enums';
import { DecodedToken, TokenUserPayload } from "../models/types";




class Cyber {

    public hashPassword(plainText: string): string {
        if (!plainText) throw new Error("Password is required for hashing");
        return crypto
            .createHmac("sha512", env.hashingSalt)
            .update(plainText)
            .digest("hex");
    }
    


    public getNewToken(user: { _id: any; email: string; name: string; role: UserRole }): string {

        const safeUser: TokenUserPayload = {
            _id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role
        };

        const payload = { user: safeUser };
        const options: SignOptions = { expiresIn: "3h" };

        return jwt.sign(payload, env.jwtSecret, options);
    }

    public verifyToken(token: string): DecodedToken {
        if (!token) throw new Error("Missing token");
        return jwt.verify(token, env.jwtSecret) as DecodedToken;
    }

    public isTokenValid(token: string): boolean {
        try {
            this.verifyToken(token);
            return true;
        } catch { return false; }
    }

    public isAdmin(token: string): boolean {
        const decoded = this.verifyToken(token);
        return decoded.user.role === UserRole.Admin;
    }

    public getUserFromToken(token: string): TokenUserPayload | null {
        try {
            const decoded = this.verifyToken(token);
            return decoded.user;
        } catch { return null; }
    }

}

export const cyber = new Cyber();