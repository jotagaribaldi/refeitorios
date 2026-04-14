import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto, UpdateRestaurantDto } from './restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) private repo: Repository<Restaurant>,
  ) {}

  async findAll(tenantId?: string) {
    const where: any = { isActive: true };
    if (tenantId) where.tenantId = tenantId;
    return this.repo.find({
      where,
      relations: ['tenant'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const r = await this.repo.findOne({ where, relations: ['tenant'] });
    if (!r) throw new NotFoundException('Refeitório não encontrado');
    return r;
  }

  async create(dto: CreateRestaurantDto, tenantId: string) {
    const { tenantId: _ignored, ...rest } = dto;
    const restaurant = this.repo.create({ ...rest, tenantId });
    return this.repo.save(restaurant);
  }

  async update(id: string, tenantId: string | undefined, dto: UpdateRestaurantDto) {
    const r = await this.findOne(id, tenantId);
    Object.assign(r, dto);
    return this.repo.save(r);
  }

  async remove(id: string, tenantId?: string) {
    const r = await this.findOne(id, tenantId);
    r.isActive = false;
    return this.repo.save(r);
  }
}
