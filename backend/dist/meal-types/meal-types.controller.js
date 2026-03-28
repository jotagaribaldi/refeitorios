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
exports.MealTypesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const meal_types_service_1 = require("./meal-types.service");
const meal_types_dto_1 = require("./meal-types.dto");
const roles_guard_1 = require("../auth/roles.guard");
const user_entity_1 = require("../users/user.entity");
let MealTypesController = class MealTypesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.findAll(tenantId);
    }
    create(dto, req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.createType(tenantId, dto);
    }
    remove(id, req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.removeType(id, tenantId);
    }
    getWindows(restaurantId) {
        return this.service.getWindowsForRestaurant(restaurantId);
    }
    upsertWindow(dto, req) {
        return this.service.upsertWindow(req.user.tenantId, dto);
    }
};
exports.MealTypesController = MealTypesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MealTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.GERENTE, user_entity_1.UserRole.ROOT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [meal_types_dto_1.CreateMealTypeDto, Object]),
    __metadata("design:returntype", void 0)
], MealTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.GERENTE, user_entity_1.UserRole.ROOT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MealTypesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('time-windows'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Query)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MealTypesController.prototype, "getWindows", null);
__decorate([
    (0, common_1.Put)('time-windows'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.GERENTE, user_entity_1.UserRole.ROOT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [meal_types_dto_1.UpdateTimeWindowDto, Object]),
    __metadata("design:returntype", void 0)
], MealTypesController.prototype, "upsertWindow", null);
exports.MealTypesController = MealTypesController = __decorate([
    (0, common_1.Controller)('meal-types'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [meal_types_service_1.MealTypesService])
], MealTypesController);
//# sourceMappingURL=meal-types.controller.js.map