import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
import { TelegramService } from '../telegram/telegram.service';
export declare class TenantsService {
    private repo;
    private telegramService;
    constructor(repo: Repository<Tenant>, telegramService: TelegramService);
    findAll(currentUser?: any): Promise<Tenant[]>;
    findOne(id: string, currentUser?: any): Promise<Tenant>;
    create(dto: CreateTenantDto, currentUser?: any): Promise<Tenant>;
    update(id: string, dto: UpdateTenantDto, currentUser?: any): Promise<Tenant>;
    remove(id: string, currentUser?: any): Promise<Tenant>;
}
