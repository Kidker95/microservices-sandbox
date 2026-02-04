import { AuthClient } from "@ms/common/clients";
import { securityMiddleware } from "@ms/common/middleware";
import express from "express";
import { env } from "../config/env";
import { userController } from "../controllers/user-controller";


const authClient = new AuthClient(env.authServiceBaseUrl);
const verifyToken = securityMiddleware.createVerifyToken(authClient);
    



export const usersRouter = express.Router();

// GET

usersRouter.get("/", // get all users
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    userController.getAllUsers.bind(userController));

    usersRouter.get("/:_id",
        verifyToken,
        securityMiddleware.createVerifyOwnerOrAdmin((req) => req.params._id! as string),
        userController.getUserById.bind(userController));
    


usersRouter.get("/by-email/:email",
    userController.getUserByEmail.bind(userController));


// POST

usersRouter.post("/",
    userController.addUser.bind(userController));

//  PUT
usersRouter.put("/:_id",
    userController.updateUser.bind(userController));

// DELETE
usersRouter.delete("/seed-wipe",
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    userController.seedWipe.bind(userController));

usersRouter.delete("/:_id", // delete specific user
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    userController.deleteUser.bind(userController));

usersRouter.delete("/", // delete all users
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    userController.deleteAll.bind(userController));
