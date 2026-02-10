import { ServiceName } from "@ms/common/enums";
import {  ServiceStatus } from "@ms/common/types";
import { env } from "../config/env";
import { BasicService } from "../models/types";
import { fetchWithTimeout } from "@ms/common/http";

class HealthClient {

    private readonly timeoutMs: number = 8000;

    private healthRoutes: BasicService[] = [
        { name: ServiceName.UserService, baseUrl: env.userServiceBaseUrl },
        { name: ServiceName.OrderService, baseUrl: env.orderServiceBaseUrl },
        { name: ServiceName.ProductService, baseUrl: env.productServiceBaseUrl },
        { name: ServiceName.ReceiptService, baseUrl: env.receiptServiceBaseUrl },
        { name: ServiceName.FortuneService, baseUrl: env.fortuneServiceBaseUrl },
        { name: ServiceName.AuthService, baseUrl: env.authServiceBaseUrl },
        { name: ServiceName.Nginx, baseUrl: env.nginxHealthUrl },
    ];

    private async checkOne(service: BasicService): Promise<ServiceStatus> {
        const checkedAt = new Date().toISOString();
        const start = Date.now();

        try {
            const response = await fetchWithTimeout(`${service.baseUrl}/health`, {}, this.timeoutMs);
            const responseTimeMs = Date.now() - start;
    
            let data: any = null;
            try { data = await response.json(); } catch { data = null; }
    
            if (!response.ok) {
                return {
                    name: service.name,
                    baseUrl: service.baseUrl,
                    ok: false,
                    statusCode: response.status,
                    responseTimeMs,
                    error: data?.error || `${response.status} ${response.statusText}`,
                    checkedAt
                };
            }
    
            return {
                name: service.name,
                baseUrl: service.baseUrl,
                ok: true,
                statusCode: response.status,
                responseTimeMs,
                uptimeSeconds: typeof data?.uptimeSeconds === "number" ? data.uptimeSeconds : undefined,
                checkedAt
            };
        } catch (err: any) {
            const responseTimeMs = Date.now() - start;
    
            const isTimeout =
                err?.name === "AbortError" ||
                String(err?.message || "").toLowerCase().includes("aborted");
    
            return {
                name: service.name,
                baseUrl: service.baseUrl,
                ok: false,
                responseTimeMs,
                error: isTimeout ? "timeout" : (err?.message || "fetch failed"),
                checkedAt
            };
        }
    }
    
    public async healthCheck(): Promise<ServiceStatus[]> {
        return Promise.all(this.healthRoutes.map(service => this.checkOne(service)));
    }
}

export const healthClient = new HealthClient();
