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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const users_service_1 = require("./users.service");
const user_dto_1 = require("./user.dto");
const roles_guard_1 = require("../auth/roles.guard");
const user_entity_1 = require("./user.entity");
let UsersController = class UsersController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(req, tenantId) {
        const tid = req.user.role === user_entity_1.UserRole.GERENTE ? req.user.tenantId : tenantId;
        return this.service.findAll(tid, req.user);
    }
    findOne(id, req) { return this.service.findOne(id, req.user); }
    async getUserBarcode(id, req) {
        const caller = req.user;
        if (caller.role !== user_entity_1.UserRole.ROOT) {
            const target = await this.service.findOne(id);
            if (target.tenantId !== caller.tenantId && caller.id !== id) {
                throw new common_1.ForbiddenException('Acesso negado');
            }
        }
        return this.service.getUserBarcodeData(id, req.user);
    }
    async getUserQrCodeAlias(id, req) {
        const caller = req.user;
        if (caller.role !== user_entity_1.UserRole.ROOT) {
            const target = await this.service.findOne(id);
            if (target.tenantId !== caller.tenantId && caller.id !== id) {
                throw new common_1.ForbiddenException('Acesso negado');
            }
        }
        return this.service.getUserBarcodeData(id, req.user);
    }
    async regenerateUserBarcode(id, req) {
        const caller = req.user;
        if (caller.role !== user_entity_1.UserRole.ROOT) {
            const target = await this.service.findOne(id);
            if (target.tenantId !== caller.tenantId) {
                throw new common_1.ForbiddenException('Acesso negado');
            }
        }
        return this.service.regenerateUserBarcode(id, req.user);
    }
    async regenerateUserQrAlias(id, req) {
        const caller = req.user;
        if (caller.role !== user_entity_1.UserRole.ROOT) {
            const target = await this.service.findOne(id);
            if (target.tenantId !== caller.tenantId) {
                throw new common_1.ForbiddenException('Acesso negado');
            }
        }
        return this.service.regenerateUserBarcode(id, req.user);
    }
    create(dto, req) {
        return this.service.create(dto, req.user);
    }
    update(id, dto, req) {
        return this.service.update(id, dto, req.user);
    }
    remove(id, req) { return this.service.remove(id, req.user); }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/barcode'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserBarcode", null);
__decorate([
    (0, common_1.Get)(':id/qrcode'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserQrCodeAlias", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-barcode'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "regenerateUserBarcode", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-qr'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "regenerateUserQrAlias", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map