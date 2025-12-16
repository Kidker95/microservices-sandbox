import dotenv from "dotenv";
dotenv.config({ quiet: true });


class Env {

    public readonly port: number = Number(process.env.PORT) || 4006;
    public readonly environment: string = process.env.NODE_ENV || "development";

    public readonly fortuneApiBaseUrl = process.env.FORTUNE_UPSTREAM_BASE_URL;


}

export const env = new Env();