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
exports.MealTypesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meal_type_entity_1 = require("./meal-type.entity");
const meal_time_window_entity_1 = require("./meal-time-window.entity");
let MealTypesService = class MealTypesService {
    typesRepo;
    windowsRepo;
    constructor(typesRepo, windowsRepo) {
        this.typesRepo = typesRepo;
        this.windowsRepo = windowsRepo;
    }
    async findAll(tenantId) {
        const qb = this.typesRepo.createQueryBuilder('mt')
            .where('mt.tenantId IS NULL');
        if (tenantId) {
            qb.orWhere('mt.tenantId = :tenantId', { tenantId });
        }
        return qb.orderBy('mt.sortOrder', 'ASC').addOrderBy('mt.name', 'ASC').getMany();
    }
    async createType(tenantId, dto) {
        const slug = dto.name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const mealType = this.typesRepo.create({
            ...dto,
            tenantId,
            slug,
        });
        return this.typesRepo.save(mealType);
    }
    async removeType(id, tenantId) {
        const where = { id };
        if (tenantId)
            where.tenantId = tenantId;
        const type = await this.typesRepo.findOne({ where });
        if (!type)
            throw new common_1.NotFoundException('Tipo de refeição não encontrado ou sem permissão');
        return this.typesRepo.remove(type);
    }
    async getWindowsForRestaurant(restaurantId) {
        return this.windowsRepo.find({
            where: { restaurantId },
            relations: ['mealType'],
            order: { mealType: { sortOrder: 'ASC' } },
        });
    }
    async upsertWindow(tenantId, dto) {
        let window = await this.windowsRepo.findOne({
            where: { restaurantId: dto.restaurantId, mealTypeId: dto.mealTypeId },
        });
        if (window) {
            Object.assign(window, dto);
        }
        else {
            let finalTenantId = tenantId;
            if (!finalTenantId) {
            }
            window = this.windowsRepo.create({ tenantId: finalTenantId, ...dto });
        }
        return this.windowsRepo.save(window);
    }
    async getCurrentMealWindow(restaurantId) {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        console.log(`[getCurrentMealWindow] restaurantId: ${restaurantId}, currentTime: ${currentTime}`);
        const windows = await this.windowsRepo.find({
            where: { restaurantId, isActive: true },
            relations: ['mealType'],
        });
        const window = windows.find((w) => {
            const start = w.startTime.slice(0, 5);
            const end = w.endTime.slice(0, 5);
            return currentTime >= start && currentTime <= end;
        });
        return window ?? null;
    }
};
exports.MealTypesService = MealTypesService;
exports.MealTypesService = MealTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meal_type_entity_1.MealType)),
    __param(1, (0, typeorm_1.InjectRepository)(meal_time_window_entity_1.MealTimeWindow)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MealTypesService);
//# sourceMappingURL=meal-types.service.js.map