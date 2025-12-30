import { BadRequestError, UnauthorizedError } from "../models/errors";
import { CredentialsModel } from "../models/credentials-model";
import { AuthContext, CredentialsInput } from "../models/types";
import { hashing } from "../utils/hashing";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userClient } from "../clients/user-client";
import { UserRole } from "../models/enums";
import { RegisterInput } from "../models/types";




class AuthService {

    public verifyToken(token: string): AuthContext {
        if (!token) throw new UnauthorizedError("Missing token");
        try {
            const payload = jwt.verify(token, env.jwtSecret) as any;

            const userId = payload?.sub;
            const role = payload?.role as UserRole;
            if (!userId || !role) throw new UnauthorizedError("Invalid token");
            return { userId, role };

        } catch { throw new UnauthorizedError("Invalid token"); }
    }

    public async register(input: RegisterInput): Promise<string> {

        if (!input.email || !input.password || !input.name || !input.address) throw new BadRequestError("Missing required fields: email, password, name, address");
        
    
        const existingUser = await userClient.getUserByEmail(input.email);
        if (existingUser) throw new BadRequestError("User already exists");
    
        const createdUser = await userClient.createUser({
            email: input.email,
            name: input.name,
            address: input.address
        });
    
        const passwordHash = await hashing.hashPassword(input.password);
    
        try {
            await CredentialsModel.create({
                email: input.email,
                passwordHash,
                userId: createdUser._id
            });
        }
        catch (err: any) {
            if (err?.code === 11000) throw new BadRequestError("email is already taken");
            throw err;
        }
    
        const token = jwt.sign(
            { sub: createdUser._id, role: createdUser.role },
            env.jwtSecret,
            { expiresIn: "1h" }
        );
    
        return token;
    }

    public async login(credentials: CredentialsInput): Promise<string> {

        if (!credentials.email || !credentials.password) throw new BadRequestError("Missing email or password");


        const existingCreds = await CredentialsModel.findOne({ email: credentials.email });
        if (!existingCreds) throw new UnauthorizedError("Invalid email or password");

        const isValid = await hashing.verifyPassword(credentials.password, existingCreds.passwordHash);
        if (!isValid) throw new UnauthorizedError("Invalid email or password");

        const user = await userClient.getUserByEmail(credentials.email);
        if (!user) throw new UnauthorizedError("Invalid email or password");

        const token = jwt.sign(
            { sub: user._id, role: user.role },
            env.jwtSecret,
            { expiresIn: "1h" }
        );
        return token;
    }

    public async logout(): Promise<void> {
        // Stateless JWT: server cannot "delete" tokens.
        // Logout is client-side (client removes the token).
        return;
    }

    

}

export const authService = new AuthService();
