import { ServiceName } from "@ms/common/enums";
import { ServiceStatus } from "@ms/common/types";

export type BasicService = {
    name: ServiceName;
    baseUrl: string;
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
