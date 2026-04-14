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
exports.MealConsumptionsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const class_validator_1 = require("class-validator");
const meal_consumptions_service_1 = require("./meal-consumptions.service");
const meal_consumption_dto_1 = require("./meal-consumption.dto");
const roles_guard_1 = require("../auth/roles.guard");
const user_entity_1 = require("../users/user.entity");
class ScanUserQrDto {
    userId;
    notes;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ScanUserQrDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScanUserQrDto.prototype, "notes", void 0);
let MealConsumptionsController = class MealConsumptionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    scanEmployee(dto, req) {
        return this.service.registerByFiscal(req.user.id, req.user.tenantId, dto.userId, dto.notes);
    }
    register(dto, req) {
        return this.service.register(req.user.id, req.user.tenantId, dto);
    }
    myConsumptions(req) {
        return this.service.findMyConsumptions(req.user.id);
    }
    findAll(req, userId, restaurantId, startDate, endDate) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.findAll(tenantId, { userId, restaurantId, startDate, endDate });
    }
};
exports.MealConsumptionsController = MealConsumptionsController;
__decorate([
    (0, common_1.Post)('scan'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.FISCAL),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ScanUserQrDto, Object]),
    __metadata("design:returntype", void 0)
], MealConsumptionsController.prototype, "scanEmployee", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [meal_consumption_dto_1.RegisterConsumptionDto, Object]),
    __metadata("design:returntype", void 0)
], MealConsumptionsController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MealConsumptionsController.prototype, "myConsumptions", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('restaurantId')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MealConsumptionsController.prototype, "findAll", null);
exports.MealConsumptionsController = MealConsumptionsController = __decorate([
    (0, common_1.Controller)('consumptions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [meal_consumptions_service_1.MealConsumptionsService])
], MealConsumptionsController);
//# sourceMappingURL=meal-consumptions.controller.js.map