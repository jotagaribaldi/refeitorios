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
    // 1. Valida funcionário pelo token de código de barras
    const user = await this.usersService.findByBarcodeToken(dto.qrCodeToken);
    if (user.id !== userId) {
      throw new BadRequestException('Código de barras não pertence a este usuário');
    }
    if (user.tenantId !== tenantId) {
      throw new BadRequestException('Código de barras não pertence à sua empresa');
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
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
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
      throw new BadRequestException(`Saldo mensal não configurado para ${String(now.getMonth() + 1).padStart(2,'0')}/${now.getFullYear()}. Contate o gerente.`);
    }

    // 6. Registra consumo
    const consumption = this.repo.create({
      tenantId,
      userId,
      restaurantId: currentWindow.restaurantId,
      mealTypeId: currentWindow.mealTypeId,
      consumedAt: now,
      date: now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
      notes: dto.notes,
    });

    const saved = await this.repo.save(consumption);
    // Retorna com relações para o app mobile montar a resposta
    return this.repo.findOne({
      where: { id: saved.id },
      relations: ['restaurant', 'mealType', 'user'],
    });
  }

  // ─── REGISTRO VIA SCAN DE CÓDIGO DE BARRAS (fluxo principal do fiscal) ───
  async registerByBarcodeToken(fiscalId: string, fiscalTenantId: string, barcodeToken: string, notes?: string) {
    // 1. Resolve o usuário pelo token do código de barras
    const targetUser = await this.usersService.findByBarcodeToken(barcodeToken);
    if (!targetUser) {
      throw new BadRequestException('Código de barras inválido ou funcionário não encontrado');
    }
    if (!targetUser.isActive) {
      throw new BadRequestException(`Funcionário ${targetUser.name} está inativo e não pode utilizar o refeitório`);
    }
    // 2. Delega para o fluxo existente usando o userId resolvido
    return this.registerByFiscal(fiscalId, fiscalTenantId, targetUser.id, notes);
  }

  // ─── REGISTRO VIA FISCAL (scan do crachá) ────────────────────────────
  async registerByFiscal(fiscalId: string, fiscalTenantId: string, targetUserId: string, notes?: string) {
    // 1. Busca e valida o usuário (verifica se existe, está ativo e tem código de barras)
    const targetUser = await this.usersService.findByBarcodeTokenForFiscal(targetUserId);


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
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
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
    let allowance: any;
    try {
      allowance = await this.allowancesService.incrementConsumed(targetUserId, now.getFullYear(), now.getMonth() + 1);
    } catch (err) {
      if (err.message === 'Saldo esgotado') {
        throw new BadRequestException(`Saldo de ${targetUser.name} está esgotado para este mês`);
      }
      // Saldo não configurado para este mês
      throw new BadRequestException(
        `Saldo de ${targetUser.name} não foi configurado para ${String(now.getMonth() + 1).padStart(2,'0')}/${now.getFullYear()}. Contate o gerente.`
      );
    }

    // 6. Registra consumo
    const consumption = this.repo.create({
      tenantId: fiscalTenantId,
      userId: targetUserId,
      restaurantId: currentWindow.restaurantId,
      mealTypeId: currentWindow.mealTypeId,
      consumedAt: now,
      date: now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
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
      allowance: allowance ? {
        total: allowance.totalAllowance,
        consumed: allowance.consumed,
        remaining: allowance.totalAllowance - allowance.consumed,
      } : null,
      authorized: true,
    };
  }

  // ─── CONSULTA DE SALDO (sem registrar consumo) ───────────────────────
  async queryBalanceByBarcodeToken(fiscalTenantId: string, barcodeToken: string) {
    // 1. Resolve o funcionário pelo token
    const targetUser = await this.usersService.findByBarcodeToken(barcodeToken);
    if (!targetUser) throw new BadRequestException('Código de barras inválido ou funcionário não encontrado');
    if (!targetUser.isActive) throw new BadRequestException(`Funcionário ${targetUser.name} está inativo`);
    if (targetUser.tenantId !== fiscalTenantId) throw new BadRequestException('Funcionário não pertence a esta empresa');

    // 2. Busca saldo do mês corrente
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const allowance = await this.allowancesService.findForUser(targetUser.id, year, month);

    // 3. Busca consumos do mês corrente
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const consumptions = await this.repo.find({
      where: { userId: targetUser.id },
      relations: ['mealType', 'restaurant'],
      order: { consumedAt: 'DESC' },
    });
    // Filtra apenas o mês corrente
    const monthConsumptions = consumptions.filter((c) => c.date >= startDate && c.date <= endDate);

    return {
      employee: {
        id: targetUser.id,
        name: targetUser.name,
        employeeCode: targetUser.employeeCode,
      },
      allowance: allowance
        ? {
            total: allowance.totalAllowance,
            consumed: allowance.consumed,
            remaining: allowance.totalAllowance - allowance.consumed,
            year,
            month,
          }
        : null,
      consumptions: monthConsumptions,
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
