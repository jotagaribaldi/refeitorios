import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';
import { MonthlyAllowance } from '../monthly-allowances/monthly-allowance.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(MealConsumption) private consumptionsRepo: Repository<MealConsumption>,
    @InjectRepository(MonthlyAllowance) private allowancesRepo: Repository<MonthlyAllowance>,
  ) {}

  async getSummary(tenantId: string | undefined, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // Total por tipo de refeição
    const qbMeal = this.consumptionsRepo
      .createQueryBuilder('c')
      .select('mt.name', 'mealType')
      .addSelect('COUNT(*)', 'total')
      .leftJoin('c.mealType', 'mt')
      .andWhere('c.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (tenantId) {
      qbMeal.andWhere('c.tenantId = :tenantId', { tenantId });
    }

    const byMealType = await qbMeal
      .groupBy('mt.name')
      .orderBy('total', 'DESC')
      .getRawMany();

    // Total por refeitório
    const qbRest = this.consumptionsRepo
      .createQueryBuilder('c')
      .select('r.name', 'restaurant')
      .addSelect('COUNT(*)', 'total')
      .leftJoin('c.restaurant', 'r')
      .andWhere('c.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (tenantId) {
      qbRest.andWhere('c.tenantId = :tenantId', { tenantId });
    }

    const byRestaurant = await qbRest
      .groupBy('r.name')
      .orderBy('total', 'DESC')
      .getRawMany();

    // Top funcionários consumidores
    const qbEmp = this.consumptionsRepo
      .createQueryBuilder('c')
      .select('u.name', 'employee')
      .addSelect('COUNT(*)', 'total')
      .leftJoin('c.user', 'u')
      .andWhere('c.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (tenantId) {
      qbEmp.andWhere('c.tenantId = :tenantId', { tenantId });
    }

    const byEmployee = await qbEmp
      .groupBy('u.name')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();

    // Total geral do mês (no período)
    const qbTotal = this.consumptionsRepo
      .createQueryBuilder('c')
      .where('c.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (tenantId) {
      qbTotal.andWhere('c.tenantId = :tenantId', { tenantId });
    }

    const totalMonth = await qbTotal.getCount();

    // Saldos restantes
    const whereAllowance: any = { year, month };
    if (tenantId) {
      whereAllowance.tenantId = tenantId;
    }

    const allowances = await this.allowancesRepo.find({
      where: whereAllowance,
      relations: ['user'],
      order: { consumed: 'DESC' },
    });

    return {
      period: { year, month, startDate, endDate },
      totalConsumedMonth: totalMonth,
      byMealType,
      byRestaurant,
      byEmployee,
      allowances: allowances.map((a) => ({
        employee: a.user?.name,
        totalAllowance: a.totalAllowance,
        consumed: a.consumed,
        remaining: a.totalAllowance - a.consumed,
      })),
    };
  }
}
