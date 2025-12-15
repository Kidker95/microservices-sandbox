import { healthClient } from "../clients/health-client";
import { DashboardViewModel, ServiceStatus } from "../models/types";

class AdminService {

    public async getDashboard(): Promise<DashboardViewModel> {
        const services: ServiceStatus[] = await healthClient.healthCheck();

        const up = services.filter(s => s.ok).length;
        const down = services.length - up;

        return {
            generatedAt: new Date().toISOString(),
            services,
            summary: {
                total: services.length,
                up,
                down
            }
        };
    }
}

export const adminService = new AdminService();
