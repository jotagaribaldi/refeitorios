import { Repository } from 'typeorm';
import { MealType } from './meal-type.entity';
import { MealTimeWindow } from './meal-time-window.entity';
import { CreateMealTypeDto, UpdateTimeWindowDto } from './meal-types.dto';
export declare class MealTypesService {
    private typesRepo;
    private windowsRepo;
    constructor(typesRepo: Repository<MealType>, windowsRepo: Repository<MealTimeWindow>);
    findAll(tenantId?: string): Promise<MealType[]>;
    createType(tenantId: string | undefined, dto: CreateMealTypeDto): Promise<MealType>;
    removeType(id: string, tenantId: string | undefined): Promise<MealType>;
    getWindowsForRestaurant(restaurantId: string): Promise<MealTimeWindow[]>;
    upsertWindow(tenantId: string | undefined, dto: UpdateTimeWindowDto): Promise<MealTimeWindow>;
    getCurrentMealWindow(restaurantId: string): Promise<MealTimeWindow | null>;
}
