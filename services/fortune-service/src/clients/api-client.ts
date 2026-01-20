import { env } from "../config/env";
import { Fortune, UpstreamQuote, UpstreamQuotesList } from "../models/types";

class ApiClient {
    private readonly fortuneApiBaseUrl = env.fortuneApiBaseUrl;
    private readonly limit: number = 30;

    private readonly fallback: Fortune = {
        fortune: "Three things can not hide for long: the Moon, the Sun and the Truth",
        author: "The Buddha",
        source: "fallback",
        fetchedAt: new Date().toISOString()
    };

    public async getRandomFortune(): Promise<Fortune> {
        try {
            const url = `${this.fortuneApiBaseUrl}/quotes/random`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch fortune");

            const data = await response.json() as UpstreamQuote;

            return {
                fortune: data.quote,
                author: data.author,
                source: "dummyJson",
                fetchedAt: new Date().toISOString()
            };
        } catch { return this.fallback; }
    }

    public async getMultipleFortunes(limit: number = this.limit): Promise<Fortune[]> {
        try {
            const url = `${this.fortuneApiBaseUrl}/quotes?limit=${limit}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch fortunes");

            const data = await response.json() as UpstreamQuotesList;

            return data.quotes.map(q => ({
                fortune: q.quote,
                author: q.author,
                source: "dummyJson",
                fetchedAt: new Date().toISOString()
            }));
        } catch { return [this.fallback]; }
    }
}

export const apiClient = new ApiClient();
