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
exports.MealType = void 0;
const typeorm_1 = require("typeorm");
const meal_time_window_entity_1 = require("./meal-time-window.entity");
const meal_consumption_entity_1 = require("../meal-consumptions/meal-consumption.entity");
let MealType = class MealType {
    id;
    tenantId;
    name;
    slug;
    sortOrder;
    timeWindows;
    consumptions;
};
exports.MealType = MealType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MealType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', nullable: true }),
    __metadata("design:type", String)
], MealType.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], MealType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], MealType.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], MealType.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => meal_time_window_entity_1.MealTimeWindow, (w) => w.mealType),
    __metadata("design:type", Array)
], MealType.prototype, "timeWindows", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => meal_consumption_entity_1.MealConsumption, (c) => c.mealType),
    __metadata("design:type", Array)
], MealType.prototype, "consumptions", void 0);
exports.MealType = MealType = __decorate([
    (0, typeorm_1.Entity)('meal_types'),
    (0, typeorm_1.Unique)(['slug', 'tenantId'])
], MealType);
//# sourceMappingURL=meal-type.entity.js.map