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
exports.RestaurantsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const restaurants_service_1 = require("./restaurants.service");
const restaurant_dto_1 = require("./restaurant.dto");
const roles_guard_1 = require("../auth/roles.guard");
const user_entity_1 = require("../users/user.entity");
let RestaurantsController = class RestaurantsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.findAll(tenantId);
    }
    findOne(id, req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.findOne(id, tenantId);
    }
    create(dto, req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT
            ? dto.tenantId
            : req.user.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('Informe a empresa (tenantId) para criar o refeitório');
        }
        return this.service.create(dto, tenantId);
    }
    update(id, dto, req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.update(id, tenantId, dto);
    }
    remove(id, req) {
        const tenantId = req.user.role === user_entity_1.UserRole.ROOT ? undefined : req.user.tenantId;
        return this.service.remove(id, tenantId);
    }
};
exports.RestaurantsController = RestaurantsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [restaurant_dto_1.CreateRestaurantDto, Object]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_dto_1.UpdateRestaurantDto, Object]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ROOT, user_entity_1.UserRole.GERENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "remove", null);
exports.RestaurantsController = RestaurantsController = __decorate([
    (0, common_1.Controller)('restaurants'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [restaurants_service_1.RestaurantsService])
], RestaurantsController);
//# sourceMappingURL=restaurants.controller.js.map