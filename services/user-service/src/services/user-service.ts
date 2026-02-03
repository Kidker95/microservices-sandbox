import { BadRequestError, NotFoundError } from "@ms/common/errors";
import { assertMongoObjectId } from '@ms/common/http';
import { User } from "../models/types";
import { UserDocument, UserModel } from "../models/user-model";
import { isValidEmail } from "@ms/common/helpers";

class UserService {

    public async getAllUsers(): Promise<UserDocument[]> { return await UserModel.find().exec(); }

    public async getUserById(_id: string): Promise<UserDocument> {
        assertMongoObjectId(_id, "_id");

        const user = await UserModel.findById(_id).exec();
        if (!user) throw new NotFoundError(`User with id ${_id} was not found`);
        return user;
    }

    public async addUser(user: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<UserDocument> {
        try {
            const userDoc = new UserModel(user);
            await userDoc.save();
            const dbUser = await this.getUserById(userDoc._id.toString())
            return dbUser;

        } catch (err: any) {
            if (err.name === "ValidationError") throw new BadRequestError(err.message);
            throw err;
        }
    }

    public async updateUser(_id: string, user: Partial<Omit<User, "_id" | "createdAt" | "updatedAt">>): Promise<UserDocument> {
        assertMongoObjectId(_id, "_id");

        const updatedUser = await UserModel.findByIdAndUpdate(_id, user,
            { new: true, runValidators: true }).exec();

        if (!updatedUser) throw new NotFoundError(`User with id ${_id} not found`);
        return updatedUser;

    }

    public async deleteUser(_id: string): Promise<void> {
        assertMongoObjectId(_id, "_id");
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

        const isValid = isValidEmail(normalizedEmail);
        if (!isValid) throw new BadRequestError(`${normalizedEmail} is not a valid email address`);

        const user = await UserModel.findOne({ email: normalizedEmail });

        if (!user) throw new NotFoundError(`User with email ${normalizedEmail} not found`);

        return user;
    }

}

export const userService = new UserService();
