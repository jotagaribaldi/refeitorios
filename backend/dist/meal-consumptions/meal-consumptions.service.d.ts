import { Repository } from 'typeorm';
import { MealConsumption } from './meal-consumption.entity';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { MealTypesService } from '../meal-types/meal-types.service';
import { MonthlyAllowancesService } from '../monthly-allowances/monthly-allowances.service';
import { UsersService } from '../users/users.service';
import { RegisterConsumptionDto } from './meal-consumption.dto';
import { TelegramService } from '../telegram/telegram.service';
import { Tenant } from '../tenants/tenant.entity';
export declare class MealConsumptionsService {
    private repo;
    private restaurantsService;
    private mealTypesService;
    private allowancesService;
    private usersService;
    private telegramService;
    constructor(repo: Repository<MealConsumption>, restaurantsService: RestaurantsService, mealTypesService: MealTypesService, allowancesService: MonthlyAllowancesService, usersService: UsersService, telegramService: TelegramService);
    register(userId: string, tenantId: string, dto: RegisterConsumptionDto): Promise<MealConsumption | null>;
    registerByBarcodeToken(fiscalId: string, fiscalTenantId: string, barcodeToken: string, notes?: string): Promise<{
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
        tenant?: Tenant | undefined;
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
    registerByFiscal(fiscalId: string, fiscalTenantId: string, targetUserId: string, notes?: string): Promise<{
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
        tenant?: Tenant | undefined;
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
    queryBalanceByBarcodeToken(fiscalTenantId: string, barcodeToken: string, currentUser?: any): Promise<{
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
        consumptions: MealConsumption[];
    }>;
    findAll(tenantId?: string, filters?: {
        userId?: string;
        restaurantId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<MealConsumption[]>;
    findMyConsumptions(userId: string): Promise<MealConsumption[]>;
}
