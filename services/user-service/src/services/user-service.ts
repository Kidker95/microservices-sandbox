import mongoose, { RegexOptions } from "mongoose";
import { UserDocument, UserModel } from "../models/user-model";
import { User } from "../models/types";
import { BadRequestError, NotFoundError } from "../models/errors";

class UserService {

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    


    public async getAllUsers(): Promise<UserDocument[]> { return await UserModel.find().exec(); }

    public async getUserById(_id: string): Promise<UserDocument> {
        this.validateId(_id);

        const user = await UserModel.findById(_id).exec();
        if (!user) throw new NotFoundError(`User with id ${_id} was not found`);
        return user;
    }

    public async addUser(user: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<UserDocument> {
        const userDoc = new UserModel(user);  // creating new mongo doc
        BadRequestError.validateSync(userDoc); // validating it
        await userDoc.save(); 
        const dbUser = await this.getUserById(userDoc._id.toString())
        return dbUser;
    }

    public async updateUser(_id: string, user: Partial<Omit<User, "_id" | "createdAt" | "updatedAt">>): Promise<UserDocument> {
        this.validateId(_id);

        const updatedUser = await UserModel.findByIdAndUpdate(
            _id,
            user,
            { new: true, runValidators: true }
        ).exec();

        if (!updatedUser) throw new NotFoundError(`User with id ${_id} not found`);
        return updatedUser;

    }

    public async deleteUser(_id: string): Promise<void> {
        this.validateId(_id);
        const deleted = await UserModel.findByIdAndDelete(_id).exec();
        if (!deleted) throw new NotFoundError(`User with id ${_id} not found`);
    }

    public async deleteAll(): Promise<number> {
        const result = await UserModel.deleteMany({});
        return result.deletedCount ?? 0;
    }

    public async deleteAllExceptEmail(email: string): Promise<number> {
        const result = await UserModel.deleteMany({ email: { $ne: email } });
        return result.deletedCount ?? 0;
    }

    public async getUserByEmail(email: string): Promise<UserDocument> {
        const normalizedEmail = email.trim().toLowerCase();
    
        const isValid = this.isValidEmail(normalizedEmail);
        if (!isValid) throw new BadRequestError(`${normalizedEmail} is not a valid email address`);
    
        const user = await UserModel.findOne({ email: normalizedEmail });
    
        if (!user) throw new NotFoundError(`User with email ${normalizedEmail} not found`);
    
        return user;
    }
    


}

export const userService = new UserService();
