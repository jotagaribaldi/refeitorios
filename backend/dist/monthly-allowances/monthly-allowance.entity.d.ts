import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
export declare class MonthlyAllowance {
    id: string;
    tenantId: string;
    tenant: Tenant;
    userId: string;
    user: User;
    year: number;
    month: number;
    totalAllowance: number;
    consumed: number;
}
