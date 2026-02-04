import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { envHelpers } from "@ms/common/config";

class Env {

    public readonly port: number = envHelpers.getNumberEnv("PORT", 4006)!;
    public readonly environment: string = envHelpers.getEnv("NODE_ENV", "development")!;

    public readonly fortuneApiBaseUrl: string | undefined = envHelpers.getUrlEnv("FORTUNE_UPSTREAM_BASE_URL");

}

export const env = new Env();
