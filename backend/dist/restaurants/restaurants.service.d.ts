import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto, UpdateRestaurantDto } from './restaurant.dto';
export declare class RestaurantsService {
    private repo;
    constructor(repo: Repository<Restaurant>);
    findAll(tenantId?: string): Promise<Restaurant[]>;
    findOne(id: string, tenantId?: string): Promise<Restaurant>;
    findByQrToken(token: string): Promise<Restaurant>;
    create(dto: CreateRestaurantDto, tenantId: string): Promise<Restaurant>;
    update(id: string, tenantId: string | undefined, dto: UpdateRestaurantDto): Promise<Restaurant>;
    regenerateQr(id: string, tenantId?: string): Promise<{
        qrCodeToken: string;
        qrDataUrl: string;
    }>;
    getQrCode(id: string, tenantId?: string): Promise<{
        qrCodeToken: string;
        qrDataUrl: string;
    }>;
    remove(id: string, tenantId?: string): Promise<Restaurant>;
}
