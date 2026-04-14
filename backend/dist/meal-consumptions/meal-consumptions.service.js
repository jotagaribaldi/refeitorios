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
exports.MealConsumptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meal_consumption_entity_1 = require("./meal-consumption.entity");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const meal_types_service_1 = require("../meal-types/meal-types.service");
const monthly_allowances_service_1 = require("../monthly-allowances/monthly-allowances.service");
const users_service_1 = require("../users/users.service");
let MealConsumptionsService = class MealConsumptionsService {
    repo;
    restaurantsService;
    mealTypesService;
    allowancesService;
    usersService;
    constructor(repo, restaurantsService, mealTypesService, allowancesService, usersService) {
        this.repo = repo;
        this.restaurantsService = restaurantsService;
        this.mealTypesService = mealTypesService;
        this.allowancesService = allowancesService;
        this.usersService = usersService;
    }
    async register(userId, tenantId, dto) {
        const user = await this.usersService.findByQrToken(dto.qrCodeToken);
        if (user.id !== userId) {
            throw new common_1.BadRequestException('QR Code não pertence a este usuário');
        }
        if (user.tenantId !== tenantId) {
            throw new common_1.BadRequestException('QR Code não pertence à sua empresa');
        }
        const allowedIds = await this.usersService.getAllowedRestaurantIds(userId);
        const currentWindow = await this.mealTypesService.getCurrentMealWindowForTenant(tenantId, allowedIds);
        if (!currentWindow) {
            throw new common_1.BadRequestException('Nenhuma refeição disponível neste horário');
        }
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
                throw new common_1.BadRequestException(`Você já consumiu ${currentWindow.mealType.name} hoje`);
            }
        }
        const now = new Date();
        try {
            await this.allowancesService.incrementConsumed(userId, now.getFullYear(), now.getMonth() + 1);
        }
        catch (err) {
            if (err.message === 'Saldo esgotado') {
                throw new common_1.BadRequestException('Saldo mensal esgotado');
            }
            throw new common_1.NotFoundException('Saldo mensal não configurado. Contate o gerente.');
        }
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
        return this.repo.findOne({
            where: { id: saved.id },
            relations: ['restaurant', 'mealType', 'user'],
        });
    }
    async registerByFiscal(fiscalId, fiscalTenantId, targetUserId, notes) {
        const targetUser = await this.usersService.findByQrTokenForFiscal(targetUserId);
        if (!targetUser) {
            throw new common_1.BadRequestException('QR Code inválido ou usuário não encontrado');
        }
        if (targetUser.tenantId !== fiscalTenantId) {
            throw new common_1.BadRequestException('Funcionário não pertence a esta empresa');
        }
        const allowedIds = await this.usersService.getAllowedRestaurantIds(targetUserId);
        const currentWindow = await this.mealTypesService.getCurrentMealWindowForTenant(fiscalTenantId, allowedIds);
        if (!currentWindow) {
            throw new common_1.BadRequestException('Nenhuma refeição disponível neste horário');
        }
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
                throw new common_1.BadRequestException(`${targetUser.name} já consumiu ${currentWindow.mealType.name} hoje`);
            }
        }
        const now = new Date();
        try {
            await this.allowancesService.incrementConsumed(targetUserId, now.getFullYear(), now.getMonth() + 1);
        }
        catch (err) {
            if (err.message === 'Saldo esgotado') {
                throw new common_1.BadRequestException(`Saldo mensal de ${targetUser.name} está esgotado`);
            }
            throw new common_1.BadRequestException('Saldo mensal não configurado. Contate o gerente.');
        }
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
    async findAll(tenantId, filters) {
        const qb = this.repo.createQueryBuilder('c')
            .leftJoinAndSelect('c.user', 'user')
            .leftJoinAndSelect('user.tenant', 'tenant')
            .leftJoinAndSelect('c.restaurant', 'restaurant')
            .leftJoinAndSelect('c.mealType', 'mealType')
            .orderBy('c.consumedAt', 'DESC');
        if (tenantId) {
            qb.andWhere('c.tenantId = :tenantId', { tenantId });
        }
        if (filters?.userId)
            qb.andWhere('c.userId = :userId', { userId: filters.userId });
        if (filters?.restaurantId)
            qb.andWhere('c.restaurantId = :restaurantId', { restaurantId: filters.restaurantId });
        if (filters?.startDate)
            qb.andWhere('c.date >= :startDate', { startDate: filters.startDate });
        if (filters?.endDate)
            qb.andWhere('c.date <= :endDate', { endDate: filters.endDate });
        return qb.getMany();
    }
    async findMyConsumptions(userId) {
        return this.repo.find({
            where: { userId },
            relations: ['restaurant', 'mealType'],
            order: { consumedAt: 'DESC' },
            take: 100,
        });
    }
};
exports.MealConsumptionsService = MealConsumptionsService;
exports.MealConsumptionsService = MealConsumptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meal_consumption_entity_1.MealConsumption)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        restaurants_service_1.RestaurantsService,
        meal_types_service_1.MealTypesService,
        monthly_allowances_service_1.MonthlyAllowancesService,
        users_service_1.UsersService])
], MealConsumptionsService);
//# sourceMappingURL=meal-consumptions.service.js.map