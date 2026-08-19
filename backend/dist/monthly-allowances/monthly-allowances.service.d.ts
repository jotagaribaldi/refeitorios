import { Repository } from 'typeorm';
import { MonthlyAllowance } from './monthly-allowance.entity';
import { CreateAllowanceDto, UpdateAllowanceDto, CreateBatchAllowanceDto } from './monthly-allowance.dto';
import { User } from '../users/user.entity';
import { TelegramService } from '../telegram/telegram.service';
export declare class MonthlyAllowancesService {
    private repo;
    private userRepo;
    private telegramService;
    constructor(repo: Repository<MonthlyAllowance>, userRepo: Repository<User>, telegramService: TelegramService);
    findAll(tenantId?: string, year?: number, month?: number): Promise<MonthlyAllowance[]>;
    findForUser(userId: string, year: number, month: number): Promise<MonthlyAllowance | null>;
    create(dto: CreateAllowanceDto, callerTenantId?: string, currentUser?: any): Promise<MonthlyAllowance | null>;
    createBatch(dto: CreateBatchAllowanceDto, callerTenantId?: string, currentUser?: any): Promise<{
        message: string;
        count: number;
        created: number;
        updated: number;
    }>;
    update(id: string, tenantId: string | undefined, dto: UpdateAllowanceDto, currentUser?: any): Promise<MonthlyAllowance>;
    incrementConsumed(userId: string, year: number, month: number): Promise<MonthlyAllowance>;
}
