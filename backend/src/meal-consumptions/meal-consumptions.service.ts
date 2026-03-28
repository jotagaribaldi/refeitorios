import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealConsumption } from './meal-consumption.entity';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { MealTypesService } from '../meal-types/meal-types.service';
import { MonthlyAllowancesService } from '../monthly-allowances/monthly-allowances.service';
import { UsersService } from '../users/users.service';
import { RegisterConsumptionDto } from './meal-consumption.dto';

@Injectable()
export class MealConsumptionsService {
  constructor(
    @InjectRepository(MealConsumption) private repo: Repository<MealConsumption>,
    private restaurantsService: RestaurantsService,
    private mealTypesService: MealTypesService,
    private allowancesService: MonthlyAllowancesService,
    private usersService: UsersService,
  ) {}

  // ─── REGISTRO DE CONSUMO (fluxo principal) ───────────────────────────
  async register(userId: string, tenantId: string, dto: RegisterConsumptionDto) {
    // 1. Valida restaurante pelo token QR
    const restaurant = await this.restaurantsService.findByQrToken(dto.qrCodeToken);
    if (restaurant.tenantId !== tenantId) {
      throw new BadRequestException('QR Code não pertence à sua empresa');
    }

    // 2. Valida se o funcionário tem permissão para usar este refeitório
    const allowedIds = await this.usersService.getAllowedRestaurantIds(userId);
    // Lista vazia = sem restrição (acesso a todos os refeitórios do tenant)
    if (allowedIds.length > 0 && !allowedIds.includes(restaurant.id)) {
      throw new BadRequestException(
        `Você não tem permissão para realizar refeições em "${restaurant.name}"`,
      );
    }

    // 3. Verifica janela de horário atual (específica do refeitório)
    const currentWindow = await this.mealTypesService.getCurrentMealWindow(restaurant.id);
    if (!currentWindow) {
      throw new BadRequestException('Nenhuma refeição disponível neste horário para este refeitório');
    }

    // 4. Verifica duplicidade no mesmo dia (se regra ativada)
    if (!currentWindow.allowDuplicate) {
      const today = new Date().toISOString().split('T')[0];
      const duplicate = await this.repo.findOne({
        where: {
          userId,
          mealTypeId: currentWindow.mealTypeId,
          date: today,
        },
      });
      if (duplicate) {
        throw new BadRequestException(
          `Você já consumiu ${currentWindow.mealType.name} hoje`,
        );
      }
    }

    // 5. Verifica e debita saldo mensal
    const now = new Date();
    try {
      await this.allowancesService.incrementConsumed(userId, now.getFullYear(), now.getMonth() + 1);
    } catch (err) {
      if (err.message === 'Saldo esgotado') {
        throw new BadRequestException('Saldo mensal esgotado');
      }
      throw new NotFoundException('Saldo mensal não configurado. Contate o gerente.');
    }

    // 6. Registra consumo
    const consumption = this.repo.create({
      tenantId,
      userId,
      restaurantId: restaurant.id,
      mealTypeId: currentWindow.mealTypeId,
      consumedAt: now,
      date: now.toISOString().split('T')[0],
      notes: dto.notes,
    });

    const saved = await this.repo.save(consumption);
    // Retorna com relações para o app mobile montar a resposta
    return this.repo.findOne({
      where: { id: saved.id },
      relations: ['restaurant', 'mealType'],
    });
  }

  // ─── LISTAGEM ─────────────────────────────────────────────────────────
  async findAll(tenantId?: string, filters?: {
    userId?: string; restaurantId?: string; startDate?: string; endDate?: string;
  }) {
    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'user')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .leftJoinAndSelect('c.restaurant', 'restaurant')
      .leftJoinAndSelect('c.mealType', 'mealType')
      .orderBy('c.consumedAt', 'DESC');

    if (tenantId) {
      qb.andWhere('c.tenantId = :tenantId', { tenantId });
    }

    if (filters?.userId) qb.andWhere('c.userId = :userId', { userId: filters.userId });
    if (filters?.restaurantId) qb.andWhere('c.restaurantId = :restaurantId', { restaurantId: filters.restaurantId });
    if (filters?.startDate) qb.andWhere('c.date >= :startDate', { startDate: filters.startDate });
    if (filters?.endDate) qb.andWhere('c.date <= :endDate', { endDate: filters.endDate });

    return qb.getMany();
  }

  async findMyConsumptions(userId: string) {
    return this.repo.find({
      where: { userId },
      relations: ['restaurant', 'mealType'],
      order: { consumedAt: 'DESC' },
      take: 100,
    });
  }
}
