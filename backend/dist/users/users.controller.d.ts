import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserRole } from './user.entity';
export declare class UsersController {
    private service;
    constructor(service: UsersService);
    findAll(req: any, tenantId?: string): Promise<{
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
        allowedRestaurants: import("../restaurants/restaurant.entity").Restaurant[];
    }[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateUserDto, req: any): Promise<any>;
    update(id: string, dto: UpdateUserDto, req: any): Promise<any>;
    remove(id: string): Promise<import("./user.entity").User>;
}
