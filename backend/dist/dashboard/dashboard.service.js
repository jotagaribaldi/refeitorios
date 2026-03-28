"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meal_consumption_entity_1 = require("../meal-consumptions/meal-consumption.entity");
const monthly_allowance_entity_1 = require("../monthly-allowances/monthly-allowance.entity");
let DashboardService = class DashboardService {
    consumptionsRepo;
    allowancesRepo;
    constructor(consumptionsRepo, allowancesRepo) {
        this.consumptionsRepo = consumptionsRepo;
        this.allowancesRepo = allowancesRepo;
    }
    async getSummary(tenantId, year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
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
        const qbTotal = this.consumptionsRepo
            .createQueryBuilder('c')
            .where('c.date BETWEEN :startDate AND :endDate', { startDate, endDate });
        if (tenantId) {
            qbTotal.andWhere('c.tenantId = :tenantId', { tenantId });
        }
        const totalMonth = await qbTotal.getCount();
        const whereAllowance = { year, month };
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meal_consumption_entity_1.MealConsumption)),
    __param(1, (0, typeorm_1.InjectRepository)(monthly_allowance_entity_1.MonthlyAllowance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map