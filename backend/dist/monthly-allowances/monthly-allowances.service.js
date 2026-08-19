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
const telegram_service_1 = require("../telegram/telegram.service");
const tenant_entity_1 = require("../tenants/tenant.entity");
let MonthlyAllowancesService = class MonthlyAllowancesService {
    repo;
    userRepo;
    telegramService;
    constructor(repo, userRepo, telegramService) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.telegramService = telegramService;
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
    async create(dto, callerTenantId, currentUser) {
        let tenantId = callerTenantId;
        if (!tenantId) {
            const targetUser = await this.userRepo.findOne({ where: { id: dto.userId } });
            if (!targetUser)
                throw new common_1.NotFoundException('Usuário não encontrado');
            tenantId = targetUser.tenantId;
        }
        if (!tenantId) {
            throw new common_1.BadRequestException('O usuário selecionado não está associado a nenhuma empresa (tenantId nulo)');
        }
        const exists = await this.repo.findOne({
            where: { userId: dto.userId, year: dto.year, month: dto.month },
        });
        if (exists)
            throw new common_1.ConflictException('Saldo já cadastrado para este período');
        const a = this.repo.create({ ...dto, tenantId, consumed: 0 });
        const saved = await this.repo.save(a);
        const fullAllowance = await this.repo.findOne({
            where: { id: saved.id },
            relations: ['user', 'user.tenant'],
        });
        if (fullAllowance) {
            this.telegramService.sendMessage(`💳 <b>Atribuição de Saldo (Individual)</b>\n` +
                `👤 <b>Funcionário:</b> ${fullAllowance.user?.name || 'N/A'} (${fullAllowance.user?.email || 'N/A'})\n` +
                `📅 <b>Período:</b> ${fullAllowance.month}/${fullAllowance.year}\n` +
                `🍽️ <b>Refeições Atribuídas:</b> ${fullAllowance.totalAllowance}\n` +
                `🏢 <b>Empresa:</b> ${fullAllowance.user?.tenant?.name || 'N/A'}\n` +
                `👤 <b>Atribuído por:</b> ${currentUser?.name || currentUser?.email || 'Sistema'}`);
        }
        return fullAllowance;
    }
    async createBatch(dto, callerTenantId, currentUser) {
        const targetTenantId = callerTenantId || dto.tenantId;
        const where = { isActive: true };
        if (targetTenantId) {
            where.tenantId = targetTenantId;
        }
        where.role = (0, typeorm_2.In)([user_entity_1.UserRole.FUNCIONARIO, user_entity_1.UserRole.FISCAL, user_entity_1.UserRole.GERENTE, user_entity_1.UserRole.VISITANTE]);
        const users = await this.userRepo.find({ where });
        if (users.length === 0) {
            throw new common_1.NotFoundException('Nenhum funcionário ativo encontrado para o critério selecionado');
        }
        let created = 0;
        let updated = 0;
        for (const user of users) {
            if (!user.tenantId) {
                continue;
            }
            const existing = await this.repo.findOne({
                where: { userId: user.id, year: dto.year, month: dto.month },
            });
            if (existing) {
                existing.totalAllowance = Math.max(dto.totalAllowance, existing.consumed);
                await this.repo.save(existing);
                updated++;
            }
            else {
                const allowance = this.repo.create({
                    userId: user.id,
                    tenantId: user.tenantId,
                    year: dto.year,
                    month: dto.month,
                    totalAllowance: dto.totalAllowance,
                    consumed: 0,
                });
                await this.repo.save(allowance);
                created++;
            }
        }
        let tenantName = 'Todas as Empresas';
        if (targetTenantId) {
            const t = await this.userRepo.manager.findOne(tenant_entity_1.Tenant, { where: { id: targetTenantId } });
            if (t)
                tenantName = t.name;
        }
        this.telegramService.sendMessage(`⚡ <b>Atribuição de Saldo em Lote</b>\n` +
            `🏢 <b>Empresa:</b> ${tenantName}\n` +
            `📅 <b>Período:</b> ${dto.month}/${dto.year}\n` +
            `🍽️ <b>Refeições por Funcionário:</b> ${dto.totalAllowance}\n` +
            `📊 <b>Funcionários afetados:</b> ${created + updated} (${created} novos, ${updated} atualizados)\n` +
            `👤 <b>Atribuído por:</b> ${currentUser?.name || currentUser?.email || 'Sistema'}`);
        return {
            message: `Saldo atribuído com sucesso para ${users.length} funcionário(s). (${created} novo(s), ${updated} atualizado(s))`,
            count: users.length,
            created,
            updated,
        };
    }
    async update(id, tenantId, dto, currentUser) {
        const where = { id };
        if (tenantId)
            where.tenantId = tenantId;
        const a = await this.repo.findOne({ where, relations: ['user'] });
        if (!a)
            throw new common_1.NotFoundException('Saldo não encontrado');
        Object.assign(a, dto);
        const saved = await this.repo.save(a);
        this.telegramService.sendMessage(`💳 <b>Saldo Mensal Atualizado</b>\n` +
            `👤 <b>Funcionário:</b> ${saved.user?.name || 'N/A'}\n` +
            `📅 <b>Período:</b> ${saved.month}/${saved.year}\n` +
            `🍽️ <b>Refeições Totais:</b> ${saved.totalAllowance}\n` +
            `🍽️ <b>Refeições Consumidas:</b> ${saved.consumed}\n` +
            `👤 <b>Atualizado por:</b> ${currentUser?.name || currentUser?.email || 'Sistema'}`);
        return saved;
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
        typeorm_2.Repository,
        telegram_service_1.TelegramService])
], MonthlyAllowancesService);
//# sourceMappingURL=monthly-allowances.service.js.map