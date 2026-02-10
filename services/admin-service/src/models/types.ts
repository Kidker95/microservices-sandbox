import { ServiceName } from "@ms/common/enums";
import { RemoteOrder, ServiceStatus } from "@ms/common/types";

export type BasicService = {
    name: ServiceName;
    baseUrl: string;
}

export interface DashboardViewModel {
    generatedAt: string;
    services: ServiceStatus[];
    orders: DashboardOrderRow[];
    ordersError?: string;
    seedJob: SeedJobStatus;
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

export type DashboardOrderRow = {
    orderId: string;
    userName: string;
    userEmail: string;
    shippingSummary: string;
    total: string;
};

export type SeedJobState = "idle" | "running" | "done" | "error";

export type SeedJobStatus = {
    state: SeedJobState;
    percent: number;
    message: string;
    startedAt?: string;
    finishedAt?: string;
    error?: string;
};

export type AdminOrder = RemoteOrder;
