import { Repository } from 'typeorm';
import { MealConsumption } from './meal-consumption.entity';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { MealTypesService } from '../meal-types/meal-types.service';
import { MonthlyAllowancesService } from '../monthly-allowances/monthly-allowances.service';
import { UsersService } from '../users/users.service';
import { RegisterConsumptionDto } from './meal-consumption.dto';
export declare class MealConsumptionsService {
    private repo;
    private restaurantsService;
    private mealTypesService;
    private allowancesService;
    private usersService;
    constructor(repo: Repository<MealConsumption>, restaurantsService: RestaurantsService, mealTypesService: MealTypesService, allowancesService: MonthlyAllowancesService, usersService: UsersService);
    register(userId: string, tenantId: string, dto: RegisterConsumptionDto): Promise<MealConsumption | null>;
    findAll(tenantId?: string, filters?: {
        userId?: string;
        restaurantId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<MealConsumption[]>;
    findMyConsumptions(userId: string): Promise<MealConsumption[]>;
}
