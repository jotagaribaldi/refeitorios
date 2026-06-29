import { MealConsumptionsService } from './meal-consumptions.service';
import { RegisterConsumptionDto } from './meal-consumption.dto';
declare class ScanBarcodeDto {
    barcodeToken: string;
    notes?: string;
}
export declare class MealConsumptionsController {
    private service;
    constructor(service: MealConsumptionsService);
    scanEmployee(dto: ScanBarcodeDto, req: any): Promise<{
        employee: {
            id: string;
            name: string;
            employeeCode: string;
        };
        allowance: {
            total: any;
            consumed: any;
            remaining: number;
        } | null;
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
    queryBalance(dto: ScanBarcodeDto, req: any): Promise<{
        employee: {
            id: string;
            name: string;
            employeeCode: string;
        };
        allowance: {
            total: number;
            consumed: number;
            remaining: number;
            year: number;
            month: number;
        } | null;
        consumptions: import("./meal-consumption.entity").MealConsumption[];
    }>;
    register(dto: RegisterConsumptionDto, req: any): Promise<import("./meal-consumption.entity").MealConsumption | null>;
    myConsumptions(req: any): Promise<import("./meal-consumption.entity").MealConsumption[]>;
    findAll(req: any, userId?: string, restaurantId?: string, startDate?: string, endDate?: string): Promise<import("./meal-consumption.entity").MealConsumption[]>;
}
export {};
