import { MealConsumptionsService } from './meal-consumptions.service';
import { RegisterConsumptionDto } from './meal-consumption.dto';
export declare class MealConsumptionsController {
    private service;
    constructor(service: MealConsumptionsService);
    register(dto: RegisterConsumptionDto, req: any): Promise<import("./meal-consumption.entity").MealConsumption | null>;
    myConsumptions(req: any): Promise<import("./meal-consumption.entity").MealConsumption[]>;
    findAll(req: any, userId?: string, restaurantId?: string, startDate?: string, endDate?: string): Promise<import("./meal-consumption.entity").MealConsumption[]>;
}
