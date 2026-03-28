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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealConsumption = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../tenants/tenant.entity");
const user_entity_1 = require("../users/user.entity");
const restaurant_entity_1 = require("../restaurants/restaurant.entity");
const meal_type_entity_1 = require("../meal-types/meal-type.entity");
let MealConsumption = class MealConsumption {
    id;
    tenantId;
    tenant;
    userId;
    user;
    restaurantId;
    restaurant;
    mealTypeId;
    mealType;
    consumedAt;
    date;
    notes;
    createdAt;
};
exports.MealConsumption = MealConsumption;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MealConsumption.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MealConsumption.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, (t) => t.consumptions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], MealConsumption.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MealConsumption.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (u) => u.consumptions),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MealConsumption.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MealConsumption.prototype, "restaurantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.Restaurant, (r) => r.consumptions),
    (0, typeorm_1.JoinColumn)({ name: 'restaurant_id' }),
    __metadata("design:type", restaurant_entity_1.Restaurant)
], MealConsumption.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MealConsumption.prototype, "mealTypeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => meal_type_entity_1.MealType, (m) => m.consumptions),
    (0, typeorm_1.JoinColumn)({ name: 'meal_type_id' }),
    __metadata("design:type", meal_type_entity_1.MealType)
], MealConsumption.prototype, "mealType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'consumed_at', type: 'timestamp', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], MealConsumption.prototype, "consumedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", String)
], MealConsumption.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], MealConsumption.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MealConsumption.prototype, "createdAt", void 0);
exports.MealConsumption = MealConsumption = __decorate([
    (0, typeorm_1.Entity)('meal_consumptions')
], MealConsumption);
//# sourceMappingURL=meal-consumption.entity.js.map