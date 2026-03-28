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
exports.MonthlyAllowancesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const monthly_allowances_service_1 = require("./monthly-allowances.service");
const monthly_allowance_dto_1 = require("./monthly-allowance.dto");
const roles_guard_1 = require("../auth/roles.guard");
const user_entity_1 = require("../users/user.entity");
let MonthlyAllowancesController = class MonthlyAllowancesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(req, year, month) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.findAll(tenantId, year ? parseInt(year) : undefined, month ? parseInt(month) : undefined);
    }
    create(dto, req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.create(dto, tenantId);
    }
    update(id, dto, req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.update(id, tenantId, dto);
    }
};
exports.MonthlyAllowancesController = MonthlyAllowancesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MonthlyAllowancesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.GERENTE, user_entity_1.UserRole.ROOT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monthly_allowance_dto_1.CreateAllowanceDto, Object]),
    __metadata("design:returntype", void 0)
], MonthlyAllowancesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.GERENTE, user_entity_1.UserRole.ROOT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, monthly_allowance_dto_1.UpdateAllowanceDto, Object]),
    __metadata("design:returntype", void 0)
], MonthlyAllowancesController.prototype, "update", null);
exports.MonthlyAllowancesController = MonthlyAllowancesController = __decorate([
    (0, common_1.Controller)('allowances'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [monthly_allowances_service_1.MonthlyAllowancesService])
], MonthlyAllowancesController);
//# sourceMappingURL=monthly-allowances.controller.js.map