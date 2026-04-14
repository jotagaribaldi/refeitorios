import { MealConsumptionsService } from './meal-consumptions.service';
import { RegisterConsumptionDto } from './meal-consumption.dto';
declare class ScanUserQrDto {
    userId: string;
    notes?: string;
}
export declare class MealConsumptionsController {
    private service;
    constructor(service: MealConsumptionsService);
    scanEmployee(dto: ScanUserQrDto, req: any): Promise<{
        employee: {
            id: string;
            name: string;
            employeeCode: string;
        };
        authorized: boolean;
        id?: string | undefined;
        tenantId?: string | undefined;
        tenant?: import("../tenants/tenant.entity").Tenant | undefined;
        userId?: string | undefined;
        user?: import("../users/user.entity").User | undefined;
        restaurantId?: string | undefined;
        restaurant?: import("../restaurants/restaurant.entity").Restaurant | undefined;
        mealTypeId?: string | undefined;
        mealType?: import("../meal-types/meal-type.entity").MealType | undefined;
        consumedAt?: Date | undefined;
        date?: string | undefined;
        notes?: string | undefined;
        createdAt?: Date | undefined;
    }>;
    register(dto: RegisterConsumptionDto, req: any): Promise<import("./meal-consumption.entity").MealConsumption | null>;
    myConsumptions(req: any): Promise<import("./meal-consumption.entity").MealConsumption[]>;
    findAll(req: any, userId?: string, restaurantId?: string, startDate?: string, endDate?: string): Promise<import("./meal-consumption.entity").MealConsumption[]>;
}
export {};
