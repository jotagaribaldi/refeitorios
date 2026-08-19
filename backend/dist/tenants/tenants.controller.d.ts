import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
export declare class TenantsController {
    private service;
    constructor(service: TenantsService);
    findAll(req: any): Promise<import("./tenant.entity").Tenant[]>;
    findOne(id: string, req: any): Promise<import("./tenant.entity").Tenant>;
    create(dto: CreateTenantDto, req: any): Promise<import("./tenant.entity").Tenant>;
    update(id: string, dto: UpdateTenantDto, req: any): Promise<import("./tenant.entity").Tenant>;
    remove(id: string, req: any): Promise<import("./tenant.entity").Tenant>;
}
