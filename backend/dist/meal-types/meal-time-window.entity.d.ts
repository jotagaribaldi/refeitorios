import { Tenant } from '../tenants/tenant.entity';
import { MealType } from './meal-type.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
export declare class MealTimeWindow {
    id: string;
    tenantId: string;
    tenant: Tenant;
    restaurantId: string;
    restaurant: Restaurant;
    mealTypeId: string;
    mealType: MealType;
    startTime: string;
    endTime: string;
    allowDuplicate: boolean;
    isActive: boolean;
}
