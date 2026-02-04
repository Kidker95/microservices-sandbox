import express from "express";
import { userController } from "../controllers/user-controller";
import { securityMiddleware } from "@ms/common/middleware";

export const usersRouter = express.Router();

// GET

usersRouter.get("/", // get all users
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    userController.getAllUsers.bind(userController));

    usersRouter.get("/:_id",
        securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
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
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    userController.seedWipe.bind(userController));

usersRouter.delete("/:_id", // delete specific user
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    userController.deleteUser.bind(userController));

usersRouter.delete("/", // delete all users
    securityMiddleware.verifyLoggedIn.bind(securityMiddleware),
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    userController.deleteAll.bind(userController));
