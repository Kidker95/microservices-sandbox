import express from "express";
import { userController } from "../controllers/user-controller";

export const usersRouter = express.Router();

// GET

usersRouter.get("/", userController.getAllUsers.bind(userController));
usersRouter.get("/:_id", userController.getUserById.bind(userController));


// POST

usersRouter.post("/", userController.addUser.bind(userController));

//  PUT
usersRouter.put("/:_id", userController.updateUser.bind(userController));

// DELETE
usersRouter.delete("/:_id", userController.deleteUser.bind(userController));
usersRouter.delete("/", userController.deleteAll.bind(userController));
