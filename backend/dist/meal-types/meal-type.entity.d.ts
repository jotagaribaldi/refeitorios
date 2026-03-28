import { MealTimeWindow } from './meal-time-window.entity';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';
export declare class MealType {
    id: string;
    tenantId: string;
    name: string;
    slug: string;
    sortOrder: number;
    timeWindows: MealTimeWindow[];
    consumptions: MealConsumption[];
}
