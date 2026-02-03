import { ServiceName } from "../enums";

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