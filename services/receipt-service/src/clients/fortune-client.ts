import { env } from "../config/env";
import { Fortune } from "../models/types";

class FortuneClient {

    private readonly fortuneBaseUrl = env.fortuneServiceBaseUrl;
    private readonly fallback: Fortune[] = [{
        fortune: "This is only a fallback. something is wrong with fortune-service",
        author: "Omri",
        source: "My head",
        fetchedAt: new Date().toISOString()
    }]

    private async fetchWithTimeout(url: string, init: RequestInit = {}, ms = 5000): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);

        try { return await fetch(url, { ...init, signal: controller.signal }); }
        finally { clearTimeout(id); }
    }

    public async getFortune(limit?: number): Promise<Fortune[]> {
        try {
            const url = limit ? `${this.fortuneBaseUrl}?limit=${limit}` : this.fortuneBaseUrl;

            const response = await this.fetchWithTimeout(url, {}, 5000);
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