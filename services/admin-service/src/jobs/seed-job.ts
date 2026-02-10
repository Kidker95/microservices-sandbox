import { runSeed } from "@ms/common/seed";
import { env } from "../config/env";
import { SeedJobStatus } from "../models/types";

class SeedJob {
    private status: SeedJobStatus = {
        state: "idle",
        percent: 0,
        message: "Idle"
    };

    public getStatus(): SeedJobStatus {
        return { ...this.status };
    }

    public start(): { started: boolean; status: SeedJobStatus; } {
        if (this.status.state === "running") {
            return { started: false, status: this.getStatus() };
        }

        const startedAt = new Date().toISOString();
        this.status = {
            state: "running",
            percent: 0,
            message: "Starting...",
            startedAt
        };

        void this.run();
        return { started: true, status: this.getStatus() };
    }

    private async run(): Promise<void> {
        try {
            await runSeed({
                baseUrl: env.gatewayBaseUrl,
                onProgress: ({ percent, message }) => {
                    this.status = {
                        ...this.status,
                        state: "running",
                        percent,
                        message
                    };
                }
            });

            this.status = {
                ...this.status,
                state: "done",
                percent: 100,
                message: "Done",
                finishedAt: new Date().toISOString()
            };
        } catch (err: any) {
            const message = err?.message || "Seed failed";
            console.error("[seed-job] failed:", err);
            this.status = {
                ...this.status,
                state: "error",
                message: "Seed failed",
                error: message,
                finishedAt: new Date().toISOString()
            };
        }
    }
}

export const seedJob = new SeedJob();
