import { apiClient } from "../clients/api-client";
import { Fortune } from "../models/types";

class FortuneService {

    public getRandomFortune(): Promise<Fortune> { return apiClient.getRandomFortune(); }

    public getMultipleFortunes(limit: number): Promise<Fortune[]> { return apiClient.getMultipleFortunes(limit); }

}

export const fortuneService = new FortuneService();