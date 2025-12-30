import { env } from "../config/env";
import bcrypt from "bcrypt";


class Hashing {

    private readonly passwordPepper: string = env.passwordPepper;
    private readonly bcryptRounds: number = env.bcryptSaltRounds;

    public async hashPassword(plainPassword: string): Promise<string> {

        const pepperedPassword = plainPassword + this.passwordPepper;   // 1. add pepper to password
        const hash = await bcrypt.hash(pepperedPassword, this.bcryptRounds); // 2. bcrypt hash
        return hash;

    }

    public async verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {

        const pepperedPassword = plainPassword + this.passwordPepper;
        return bcrypt.compare(pepperedPassword,passwordHash);
    }

}

export const hashing = new Hashing();