import { NextFunction, Request, Response } from "express";
import { fortuneService } from "../services/fortune-service";
import { StatusCode } from "../models/enums";

class FortuneController {

    public async getFortune(req: Request, res: Response, next: NextFunction) {
        try {
            const limitParam = req.query.limit;

            if (limitParam === undefined) return res.json(await fortuneService.getRandomFortune());

            const limit = Number(limitParam);

            if (!Number.isInteger(limit) || limit <= 0) return res
            .status(StatusCode.BadRequest)
            .json({error: "limit must be a positive integer"});
            
            if (limit > 1454) return res
            .status(StatusCode.BadRequest)
            .json({error: "max limit is 1454"});
            

            return res.json(await fortuneService.getMultipleFortunes(limit));

        } catch (err) { next(err); }
    }
}

export const fortuneController = new FortuneController();
