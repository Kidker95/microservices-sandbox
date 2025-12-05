import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user-service";
import { StatusCode } from "../models/enums";
import express from 'express'


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

}

export const userController = new UserController();
