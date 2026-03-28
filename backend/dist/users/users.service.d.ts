import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Restaurant } from '../restaurants/restaurant.entity';
export declare class UsersService {
    private repo;
    private restaurantRepo;
    constructor(repo: Repository<User>, restaurantRepo: Repository<Restaurant>);
    findAll(tenantId?: string): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        name: string;
        email: string;
        role: UserRole;
        employeeCode: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        allowances: import("../monthly-allowances/monthly-allowance.entity").MonthlyAllowance[];
        consumptions: import("../meal-consumptions/meal-consumption.entity").MealConsumption[];
        allowedRestaurants: Restaurant[];
    }[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateUserDto, currentUser: any): Promise<any>;
    update(id: string, dto: UpdateUserDto, currentUser: any): Promise<any>;
    remove(id: string): Promise<User>;
    getAllowedRestaurantIds(userId: string): Promise<string[]>;
    seedRoot(): Promise<void>;
}
