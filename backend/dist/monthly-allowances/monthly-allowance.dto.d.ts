export declare class CreateAllowanceDto {
    userId: string;
    year: number;
    month: number;
    totalAllowance: number;
}
export declare class UpdateAllowanceDto {
    totalAllowance?: number;
}
export declare class CreateBatchAllowanceDto {
    tenantId?: string;
    year: number;
    month: number;
    totalAllowance: number;
}
