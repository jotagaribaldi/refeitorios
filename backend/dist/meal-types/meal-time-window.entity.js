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
exports.MealTimeWindow = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../tenants/tenant.entity");
const meal_type_entity_1 = require("./meal-type.entity");
const restaurant_entity_1 = require("../restaurants/restaurant.entity");
let MealTimeWindow = class MealTimeWindow {
    id;
    tenantId;
    tenant;
    restaurantId;
    restaurant;
    mealTypeId;
    mealType;
    startTime;
    endTime;
    allowDuplicate;
    isActive;
};
exports.MealTimeWindow = MealTimeWindow;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MealTimeWindow.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MealTimeWindow.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, (t) => t.mealTimeWindows, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], MealTimeWindow.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MealTimeWindow.prototype, "restaurantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.Restaurant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'restaurant_id' }),
    __metadata("design:type", restaurant_entity_1.Restaurant)
], MealTimeWindow.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MealTimeWindow.prototype, "mealTypeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => meal_type_entity_1.MealType, (m) => m.timeWindows),
    (0, typeorm_1.JoinColumn)({ name: 'meal_type_id' }),
    __metadata("design:type", meal_type_entity_1.MealType)
], MealTimeWindow.prototype, "mealType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], MealTimeWindow.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], MealTimeWindow.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allow_duplicate', default: false }),
    __metadata("design:type", Boolean)
], MealTimeWindow.prototype, "allowDuplicate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MealTimeWindow.prototype, "isActive", void 0);
exports.MealTimeWindow = MealTimeWindow = __decorate([
    (0, typeorm_1.Entity)('meal_time_windows'),
    (0, typeorm_1.Unique)(['restaurantId', 'mealTypeId'])
], MealTimeWindow);
//# sourceMappingURL=meal-time-window.entity.js.map