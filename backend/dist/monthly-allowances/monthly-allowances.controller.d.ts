import { MonthlyAllowancesService } from './monthly-allowances.service';
import { CreateAllowanceDto, UpdateAllowanceDto } from './monthly-allowance.dto';
export declare class MonthlyAllowancesController {
    private service;
    constructor(service: MonthlyAllowancesService);
    findAll(req: any, year?: string, month?: string): Promise<import("./monthly-allowance.entity").MonthlyAllowance[]>;
    create(dto: CreateAllowanceDto, req: any): Promise<import("./monthly-allowance.entity").MonthlyAllowance | null>;
    update(id: string, dto: UpdateAllowanceDto, req: any): Promise<import("./monthly-allowance.entity").MonthlyAllowance>;
}
