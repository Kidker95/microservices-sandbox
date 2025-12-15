import { ServiceName } from "./enums";

export type BasicService = {
    name: ServiceName;
    baseUrl: string;
}

export interface ServiceStatus {
    name: ServiceName;
    baseUrl: string;
    ok: boolean;
    statusCode?: number;
    responseTimeMs?: number;
    uptimeSeconds?: number;
    error?: string;
    checkedAt: string;
}

export interface DashboardViewModel {
    generatedAt: string;
    services: ServiceStatus[];
    summary: {
        total: number;
        up: number;
        down: number;
    };
}
