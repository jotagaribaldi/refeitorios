import { UserRole } from './user.entity';
export declare class CreateUserDto {
    tenantId?: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    employeeCode?: string;
    allowedRestaurantIds?: string[];
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    employeeCode?: string;
    allowedRestaurantIds?: string[];
}
