import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { TelegramService } from '../telegram/telegram.service';
export declare class AuthService {
    private usersRepo;
    private jwtService;
    private telegramService;
    constructor(usersRepo: Repository<User>, jwtService: JwtService, telegramService: TelegramService);
    validateUser(email: string, password: string): Promise<User | null>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../users/user.entity").UserRole;
            tenantId: string;
            tenant: import("../tenants/tenant.entity").Tenant;
        };
    }>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    hashPassword(password: string): Promise<string>;
}
