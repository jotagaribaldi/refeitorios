import { Repository } from 'typeorm';
import { MonthlyAllowance } from './monthly-allowance.entity';
import { CreateAllowanceDto, UpdateAllowanceDto } from './monthly-allowance.dto';
import { User } from '../users/user.entity';
export declare class MonthlyAllowancesService {
    private repo;
    private userRepo;
    constructor(repo: Repository<MonthlyAllowance>, userRepo: Repository<User>);
    findAll(tenantId?: string, year?: number, month?: number): Promise<MonthlyAllowance[]>;
    findForUser(userId: string, year: number, month: number): Promise<MonthlyAllowance | null>;
    create(dto: CreateAllowanceDto, callerTenantId?: string): Promise<MonthlyAllowance | null>;
    update(id: string, tenantId: string | undefined, dto: UpdateAllowanceDto): Promise<MonthlyAllowance>;
    incrementConsumed(userId: string, year: number, month: number): Promise<MonthlyAllowance>;
}
