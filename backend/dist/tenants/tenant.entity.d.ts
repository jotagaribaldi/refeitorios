import { User } from '../users/user.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { MealTimeWindow } from '../meal-types/meal-time-window.entity';
import { MonthlyAllowance } from '../monthly-allowances/monthly-allowance.entity';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';
export declare class Tenant {
    id: string;
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
    restaurants: Restaurant[];
    mealTimeWindows: MealTimeWindow[];
    allowances: MonthlyAllowance[];
    consumptions: MealConsumption[];
}
