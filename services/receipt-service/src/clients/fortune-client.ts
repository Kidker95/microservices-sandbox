import { env } from "../config/env";
import { Fortune } from "@ms/common/types";
import { fetchWithTimeout } from "@ms/common";

class FortuneClient {

    private readonly fortuneBaseUrl = env.fortuneServiceBaseUrl;
    private readonly fallback: Fortune[] = [{
        fortune: "This is only a fallback. something is wrong with fortune-service",
        author: "Omri",
        source: "My head",
        fetchedAt: new Date().toISOString()
    }]

   

    public async getFortune(limit?: number): Promise<Fortune[]> {
        try {
            const url = limit ? `${this.fortuneBaseUrl}?limit=${limit}` : this.fortuneBaseUrl;

            const response = await fetchWithTimeout(url, {}, 5000);
            if (!response.ok) throw new Error(`fortune-service error`);

            const data = await response.json();
            if (Array.isArray(data)) return data;
            return [data];

        } catch (err) {
            console.warn("fortune-service unavailable, using fallback");
            return this.fallback;
        }
    }

}

export const fortuneClient = new FortuneClient();