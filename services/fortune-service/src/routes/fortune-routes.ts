import express from "express";
import { fortuneController } from "../controllers/fortune-controller";

export const fortuneRouter = express.Router();

fortuneRouter.get("/fortune", fortuneController.getFortune.bind(fortuneController));
