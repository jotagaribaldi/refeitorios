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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const telegram_service_1 = require("../telegram/telegram.service");
let TenantsService = class TenantsService {
    repo;
    telegramService;
    constructor(repo, telegramService) {
        this.repo = repo;
        this.telegramService = telegramService;
    }
    async findAll(currentUser) {
        this.telegramService.sendMessage(`🔍 <b>Consulta de Empresas</b>\n` +
            `📋 <b>Ação:</b> Listagem de todas as empresas\n` +
            `👤 <b>Consultado por:</b> ${currentUser?.email || 'Sistema'}`);
        return this.repo.find({ order: { name: 'ASC' } });
    }
    async findOne(id, currentUser) {
        const tenant = await this.repo.findOne({ where: { id } });
        if (!tenant)
            throw new common_1.NotFoundException('Empresa não encontrada');
        this.telegramService.sendMessage(`🔍 <b>Consulta de Empresa</b>\n` +
            `🏢 <b>Empresa:</b> ${tenant.name}\n` +
            `👤 <b>Consultado por:</b> ${currentUser?.email || 'Sistema'}`);
        return tenant;
    }
    async create(dto, currentUser) {
        const exists = await this.repo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email já cadastrado');
        const tenant = this.repo.create(dto);
        const saved = await this.repo.save(tenant);
        this.telegramService.sendMessage(`🏢 <b>Empresa Cadastrada</b>\n` +
            `🏢 <b>Nome:</b> ${saved.name}\n` +
            `📧 <b>E-mail:</b> ${saved.email}\n` +
            `👤 <b>Criado por:</b> ${currentUser?.email || 'Sistema'}`);
        return saved;
    }
    async update(id, dto, currentUser) {
        const tenant = await this.repo.findOne({ where: { id } });
        if (!tenant)
            throw new common_1.NotFoundException('Empresa não encontrada');
        Object.assign(tenant, dto);
        const saved = await this.repo.save(tenant);
        this.telegramService.sendMessage(`🏢 <b>Empresa Atualizada</b>\n` +
            `🏢 <b>Nome:</b> ${saved.name}\n` +
            `📧 <b>E-mail:</b> ${saved.email}\n` +
            `👤 <b>Atualizado por:</b> ${currentUser?.email || 'Sistema'}`);
        return saved;
    }
    async remove(id, currentUser) {
        const tenant = await this.repo.findOne({ where: { id } });
        if (!tenant)
            throw new common_1.NotFoundException('Empresa não encontrada');
        tenant.isActive = false;
        const saved = await this.repo.save(tenant);
        this.telegramService.sendMessage(`🏢 <b>Empresa Desativada/Excluída</b>\n` +
            `🏢 <b>Nome:</b> ${saved.name}\n` +
            `📧 <b>E-mail:</b> ${saved.email}\n` +
            `👤 <b>Excluído por:</b> ${currentUser?.email || 'Sistema'}`);
        return saved;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        telegram_service_1.TelegramService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map