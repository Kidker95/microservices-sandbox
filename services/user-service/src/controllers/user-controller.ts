import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user-service";
import { StatusCode } from "../models/enums";
import { ForbiddenError } from "../models/errors";
import { env } from "../config/env";


class UserController {

    public async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try { return res.json(await userService.getAllUsers()); }
        catch (err) { next(err); }
    }

    public async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "Missing user _id" });
            const user = await userService.getUserById(_id as string);
            if (!user) return res.status(StatusCode.NotFound).json({ error: `User with id ${_id} was not found` });
            return res.json(user);
        } catch (err) { next(err); }

    }

    public async addUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.body;
            const dbUser = await userService.addUser(user);
            return res.status(StatusCode.Created).json(dbUser);
        } catch (err) { next(err); }

    }

    public async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "Missing user _id" });
            const updatedUserData = req.body;
            const dbUser = await userService.updateUser(_id, updatedUserData);
            return res.json(dbUser);
        } catch (err) { next(err); }

    }

    public async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "Missing user _id" });
            await userService.deleteUser(_id);
            return res.status(StatusCode.NoContent).json({ info: `Deleted successfully` })
        } catch (err) { next(err); }

    }

    public async deleteAll(req: Request, res: Response, next: NextFunction) {
        try {
            const deleteCount = await userService.deleteAll();
            return res.status(StatusCode.OK).json({deleted: deleteCount})
        } catch (err) { next(err); }
    }

    public async seedWipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (env.environment === "production") throw new ForbiddenError("Seed wipe is disabled in production");
            if (req.header("x-seed-wipe") !== "true") throw new ForbiddenError("Seed wipe header missing");
            const deleteCount = await userService.deleteAllExceptEmail(env.seedRootAdminEmail);
            return res.status(StatusCode.OK).json({ deleted: deleteCount });
        } catch (err) { next(err); }
    }

    public async getUserByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.params.email;
            if(!email) return res.status(StatusCode.BadRequest).json({error: "Missing email"});
            const user = await userService.getUserByEmail(email);
            if(!user) return res.status(StatusCode.NotFound).json({error: `User with email ${email} not found`});
            return res.status(StatusCode.OK).json(user);
        } catch (err) { next(err); }
    }

}

export const userController = new UserController();
