import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { MealType } from '../meal-types/meal-type.entity';
export declare class MealConsumption {
    id: string;
    tenantId: string;
    tenant: Tenant;
    userId: string;
    user: User;
    restaurantId: string;
    restaurant: Restaurant;
    mealTypeId: string;
    mealType: MealType;
    consumedAt: Date;
    date: string;
    notes: string;
    createdAt: Date;
}
