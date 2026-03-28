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
exports.MonthlyAllowancesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const monthly_allowance_entity_1 = require("./monthly-allowance.entity");
const user_entity_1 = require("../users/user.entity");
let MonthlyAllowancesService = class MonthlyAllowancesService {
    repo;
    userRepo;
    constructor(repo, userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }
    async findAll(tenantId, year, month) {
        const where = {};
        if (tenantId)
            where.tenantId = tenantId;
        if (year)
            where.year = year;
        if (month)
            where.month = month;
        return this.repo.find({
            where,
            relations: ['user', 'user.tenant'],
            order: { year: 'DESC', month: 'DESC' },
        });
    }
    async findForUser(userId, year, month) {
        return this.repo.findOne({ where: { userId, year, month } });
    }
    async create(dto, callerTenantId) {
        let tenantId = callerTenantId;
        if (!tenantId) {
            const targetUser = await this.userRepo.findOne({ where: { id: dto.userId } });
            if (!targetUser)
                throw new common_1.NotFoundException('Usuário não encontrado');
            tenantId = targetUser.tenantId;
        }
        const exists = await this.repo.findOne({
            where: { userId: dto.userId, year: dto.year, month: dto.month },
        });
        if (exists)
            throw new common_1.ConflictException('Saldo já cadastrado para este período');
        const a = this.repo.create({ ...dto, tenantId, consumed: 0 });
        const saved = await this.repo.save(a);
        return this.repo.findOne({ where: { id: saved.id }, relations: ['user'] });
    }
    async update(id, tenantId, dto) {
        const where = { id };
        if (tenantId)
            where.tenantId = tenantId;
        const a = await this.repo.findOne({ where });
        if (!a)
            throw new common_1.NotFoundException('Saldo não encontrado');
        Object.assign(a, dto);
        return this.repo.save(a);
    }
    async incrementConsumed(userId, year, month) {
        const allowance = await this.findForUser(userId, year, month);
        if (!allowance)
            throw new common_1.NotFoundException('Saldo mensal não configurado');
        if (allowance.consumed >= allowance.totalAllowance) {
            throw new Error('Saldo esgotado');
        }
        allowance.consumed += 1;
        return this.repo.save(allowance);
    }
};
exports.MonthlyAllowancesService = MonthlyAllowancesService;
exports.MonthlyAllowancesService = MonthlyAllowancesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(monthly_allowance_entity_1.MonthlyAllowance)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MonthlyAllowancesService);
//# sourceMappingURL=monthly-allowances.service.js.map