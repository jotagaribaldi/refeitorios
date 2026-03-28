import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
export declare class TenantsService {
    private repo;
    constructor(repo: Repository<Tenant>);
    findAll(): Promise<Tenant[]>;
    findOne(id: string): Promise<Tenant>;
    create(dto: CreateTenantDto): Promise<Tenant>;
    update(id: string, dto: UpdateTenantDto): Promise<Tenant>;
    remove(id: string): Promise<Tenant>;
}
