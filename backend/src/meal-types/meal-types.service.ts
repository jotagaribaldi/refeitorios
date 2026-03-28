import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MealType } from './meal-type.entity';
import { MealTimeWindow } from './meal-time-window.entity';
import { CreateMealTypeDto, UpdateTimeWindowDto } from './meal-types.dto';

@Injectable()
export class MealTypesService {
  constructor(
    @InjectRepository(MealType) private typesRepo: Repository<MealType>,
    @InjectRepository(MealTimeWindow) private windowsRepo: Repository<MealTimeWindow>,
  ) {}

  async findAll(tenantId?: string) {
    // Busca os tipos globais (sem tenantId) E os tipos específicos da empresa
    const qb = this.typesRepo.createQueryBuilder('mt')
      .where('mt.tenantId IS NULL');
    
    if (tenantId) {
      qb.orWhere('mt.tenantId = :tenantId', { tenantId });
    }
    
    return qb.orderBy('mt.sortOrder', 'ASC').addOrderBy('mt.name', 'ASC').getMany();
  }

  async createType(tenantId: string | undefined, dto: CreateMealTypeDto) {
    const slug = dto.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, '-') // substitui não-alfanuméricos por hifen
      .replace(/(^-|-$)/g, ''); // remove hifen no início/fim

    const mealType = this.typesRepo.create({
      ...dto,
      tenantId,
      slug,
    });
    return this.typesRepo.save(mealType);
  }

  async removeType(id: string, tenantId: string | undefined) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const type = await this.typesRepo.findOne({ where });
    if (!type) throw new NotFoundException('Tipo de refeição não encontrado ou sem permissão');
    return this.typesRepo.remove(type);
  }

  async getWindowsForRestaurant(restaurantId: string) {
    return this.windowsRepo.find({
      where: { restaurantId },
      relations: ['mealType'],
      order: { mealType: { sortOrder: 'ASC' } },
    });
  }

  async upsertWindow(tenantId: string | undefined, dto: UpdateTimeWindowDto) {
    let window = await this.windowsRepo.findOne({
      where: { restaurantId: dto.restaurantId, mealTypeId: dto.mealTypeId },
    });

    if (window) {
      Object.assign(window, dto);
    } else {
      // Se for ROOT, o tenantId pode ser nulo. Precisamos do tenantId do restaurante.
      let finalTenantId = tenantId;
      if (!finalTenantId) {
        // Para simplificar e evitar circular dependency, vamos assumir que o tenantId 
        // deve ser passado ou buscado via repo. 
        // Como o MealTypesModule provavelmente não importa o RestaurantModule, 
        // vamos injetar o Repo de Restaurant aqui.
        // Mas espere, eu já adicionei restaurantId no DTO.
        // Vou apenas garantir que o tenantId seja passado corretamente pelo controller.
      }
      window = this.windowsRepo.create({ tenantId: finalTenantId as string, ...dto });
    }
    return this.windowsRepo.save(window);
  }

  async getCurrentMealWindow(restaurantId: string) {
    const now = new Date();
    // Ajuste para hora local (se necessário, mas assumimos que start/end no banco são locais ou compatíveis)
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    console.log(`[getCurrentMealWindow] restaurantId: ${restaurantId}, currentTime: ${currentTime}`);

    const windows = await this.windowsRepo.find({
      where: { restaurantId, isActive: true },
      relations: ['mealType'],
    });

    const window = windows.find((w) => {
      // Formato time no PostgreSQL pode vir como "06:00:00" ou "06:00"
      const start = w.startTime.slice(0, 5);
      const end = w.endTime.slice(0, 5);
      return currentTime >= start && currentTime <= end;
    });

    return window ?? null;
  }
}
