import { MonthlyAllowancesService } from './monthly-allowances.service';
import { CreateAllowanceDto, UpdateAllowanceDto, CreateBatchAllowanceDto } from './monthly-allowance.dto';
export declare class MonthlyAllowancesController {
    private service;
    constructor(service: MonthlyAllowancesService);
    findAll(req: any, year?: string, month?: string): Promise<import("./monthly-allowance.entity").MonthlyAllowance[]>;
    create(dto: CreateAllowanceDto, req: any): Promise<import("./monthly-allowance.entity").MonthlyAllowance | null>;
    createBatch(dto: CreateBatchAllowanceDto, req: any): Promise<{
        message: string;
        count: number;
        created: number;
        updated: number;
    }>;
    update(id: string, dto: UpdateAllowanceDto, req: any): Promise<import("./monthly-allowance.entity").MonthlyAllowance>;
}
