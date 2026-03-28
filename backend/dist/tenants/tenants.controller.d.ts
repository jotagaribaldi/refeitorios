import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
export declare class TenantsController {
    private service;
    constructor(service: TenantsService);
    findAll(): Promise<import("./tenant.entity").Tenant[]>;
    findOne(id: string): Promise<import("./tenant.entity").Tenant>;
    create(dto: CreateTenantDto): Promise<import("./tenant.entity").Tenant>;
    update(id: string, dto: UpdateTenantDto): Promise<import("./tenant.entity").Tenant>;
    remove(id: string): Promise<import("./tenant.entity").Tenant>;
}
