import { Repository } from 'typeorm';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';
import { MonthlyAllowance } from '../monthly-allowances/monthly-allowance.entity';
export declare class DashboardService {
    private consumptionsRepo;
    private allowancesRepo;
    constructor(consumptionsRepo: Repository<MealConsumption>, allowancesRepo: Repository<MonthlyAllowance>);
    getSummary(tenantId: string | undefined, year: number, month: number): Promise<{
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
