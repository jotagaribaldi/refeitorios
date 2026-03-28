import { Tenant } from '../tenants/tenant.entity';
import { MonthlyAllowance } from '../monthly-allowances/monthly-allowance.entity';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
export declare enum UserRole {
    ROOT = "ROOT",
    GERENTE = "GERENTE",
    FUNCIONARIO = "FUNCIONARIO"
}
export declare class User {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    employeeCode: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    allowances: MonthlyAllowance[];
    consumptions: MealConsumption[];
    allowedRestaurants: Restaurant[];
}
