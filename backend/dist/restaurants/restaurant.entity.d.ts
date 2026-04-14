import { Tenant } from '../tenants/tenant.entity';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';
export declare class Restaurant {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    location: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    consumptions: MealConsumption[];
}
