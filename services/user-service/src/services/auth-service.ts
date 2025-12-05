import { UserRole } from "../models/enums";
import { BadRequestError, UnauthorizedError } from "../models/errors";
import { CredentialsModel, RegisterUserPayload } from "../models/types";
import { UserModel } from "../models/user-model";
import { cyber } from "./cyber";

class AuthService {

    public async register(user: RegisterUserPayload): Promise<string> {
        try {
            const passwordHash = cyber.hashPassword(user.password);
    
            const userDoc = new UserModel({
                email: user.email,
                passwordHash,
                name: user.name,
                role: UserRole.User,
                address: user.address
            });
    
            BadRequestError.validateSync(userDoc);
    
            const savedUser = await userDoc.save();
    
            return cyber.getNewToken(savedUser.toObject());
        } catch (err: any) {
            if (err.code === 11000) throw new BadRequestError("email is already taken");
            throw err;
        }
    }
    
    public async login(credentials: CredentialsModel): Promise<string> {
        if (!credentials.email || !credentials.password) throw new BadRequestError("Missing email or password");
        
        const hashedPassword = cyber.hashPassword(credentials.password);
        const user = await UserModel.findOne({
            email: credentials.email,
            passwordHash: hashedPassword
        }).exec();
    
        if (!user) throw new UnauthorizedError("Email or password are incorrect");
        return cyber.getNewToken(user.toObject());
    }
    

}

export const authService = new AuthService();