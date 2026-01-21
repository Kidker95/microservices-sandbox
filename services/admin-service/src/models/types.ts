import { Service } from './../../node_modules/ts-node/dist/index.d';
import { ServiceName, UserRole } from "./enums";

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

export type LoginViewModel = {
    error?: string;
    email?: string;
    next?: string;
};

export type AuthContext = {
    userId: string;
    role: UserRole;
};