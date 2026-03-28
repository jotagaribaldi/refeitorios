import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private service;
    constructor(service: DashboardService);
    getSummary(req: any, year?: string, month?: string): Promise<{
        period: {
            year: number;
            month: number;
            startDate: string;
            endDate: string;
        };
        totalConsumedMonth: number;
        byMealType: any[];
        byRestaurant: any[];
        byEmployee: any[];
        allowances: {
            employee: string;
            totalAllowance: number;
            consumed: number;
            remaining: number;
        }[];
    }>;
}
