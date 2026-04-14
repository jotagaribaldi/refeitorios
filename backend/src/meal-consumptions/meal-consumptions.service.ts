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
    // 1. Valida funcionário pelo token QR
    const user = await this.usersService.findByQrToken(dto.qrCodeToken);
    if (user.id !== userId) {
      throw new BadRequestException('QR Code não pertence a este usuário');
    }
    if (user.tenantId !== tenantId) {
      throw new BadRequestException('QR Code não pertence à sua empresa');
    }

    // 2. Obtém lista de refeitórios permitidos
    const allowedIds = await this.usersService.getAllowedRestaurantIds(userId);

    // 3. Encontra janela de refeição disponível para o tenant
    const currentWindow = await this.mealTypesService.getCurrentMealWindowForTenant(tenantId, allowedIds);
    if (!currentWindow) {
      throw new BadRequestException('Nenhuma refeição disponível neste horário');
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
      restaurantId: currentWindow.restaurantId,
      mealTypeId: currentWindow.mealTypeId,
      consumedAt: now,
      date: now.toISOString().split('T')[0],
      notes: dto.notes,
    });

    const saved = await this.repo.save(consumption);
    // Retorna com relações para o app mobile montar a resposta
    return this.repo.findOne({
      where: { id: saved.id },
      relations: ['restaurant', 'mealType', 'user'],
    });
  }

  // ─── REGISTRO VIA FISCAL (scan do crachá) ────────────────────────────
  async registerByFiscal(fiscalId: string, fiscalTenantId: string, targetUserId: string, notes?: string) {
    // 1. Busca e valida o usuário pelo token QR
    const targetUser = await this.usersService.findByQrTokenForFiscal(targetUserId);
    if (!targetUser) {
      throw new BadRequestException('QR Code inválido ou usuário não encontrado');
    }

    // 2. Verifica que o funcionário pertence ao mesmo tenant do FISCAL
    if (targetUser.tenantId !== fiscalTenantId) {
      throw new BadRequestException('Funcionário não pertence a esta empresa');
    }

    // 3. Determina o refeitório baseado nos permitidos do funcionário
    // Obtém lista de restaurantes permitidos; se vazia, busca todos do tenant
    const allowedIds = await this.usersService.getAllowedRestaurantIds(targetUserId);

    // Obtém o horário atual e encontra qual restaurante tem janela aberta
    const currentWindow = await this.mealTypesService.getCurrentMealWindowForTenant(fiscalTenantId, allowedIds);
    if (!currentWindow) {
      throw new BadRequestException('Nenhuma refeição disponível neste horário');
    }

    // 4. Verifica duplicidade no mesmo dia
    if (!currentWindow.allowDuplicate) {
      const today = new Date().toISOString().split('T')[0];
      const duplicate = await this.repo.findOne({
        where: {
          userId: targetUserId,
          mealTypeId: currentWindow.mealTypeId,
          date: today,
        },
      });
      if (duplicate) {
        throw new BadRequestException(
          `${targetUser.name} já consumiu ${currentWindow.mealType.name} hoje`,
        );
      }
    }

    // 5. Verifica e debita saldo mensal do funcionário
    const now = new Date();
    try {
      await this.allowancesService.incrementConsumed(targetUserId, now.getFullYear(), now.getMonth() + 1);
    } catch (err) {
      if (err.message === 'Saldo esgotado') {
        throw new BadRequestException(`Saldo mensal de ${targetUser.name} está esgotado`);
      }
      throw new BadRequestException('Saldo mensal não configurado. Contate o gerente.');
    }

    // 6. Registra consumo
    const consumption = this.repo.create({
      tenantId: fiscalTenantId,
      userId: targetUserId,
      restaurantId: currentWindow.restaurantId,
      mealTypeId: currentWindow.mealTypeId,
      consumedAt: now,
      date: now.toISOString().split('T')[0],
      notes,
    });

    const saved = await this.repo.save(consumption);
    const result = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['restaurant', 'mealType', 'user'],
    });

    return {
      ...result,
      employee: {
        id: targetUser.id,
        name: targetUser.name,
        employeeCode: targetUser.employeeCode,
      },
      authorized: true,
    };
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
