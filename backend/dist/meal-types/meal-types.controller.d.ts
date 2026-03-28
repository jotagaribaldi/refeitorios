import { MealTypesService } from './meal-types.service';
import { CreateMealTypeDto, UpdateTimeWindowDto } from './meal-types.dto';
export declare class MealTypesController {
    private service;
    constructor(service: MealTypesService);
    findAll(req: any): Promise<import("./meal-type.entity").MealType[]>;
    create(dto: CreateMealTypeDto, req: any): Promise<import("./meal-type.entity").MealType>;
    remove(id: string, req: any): Promise<import("./meal-type.entity").MealType>;
    getWindows(restaurantId: string): Promise<import("./meal-time-window.entity").MealTimeWindow[]>;
    upsertWindow(dto: UpdateTimeWindowDto, req: any): Promise<import("./meal-time-window.entity").MealTimeWindow>;
}
