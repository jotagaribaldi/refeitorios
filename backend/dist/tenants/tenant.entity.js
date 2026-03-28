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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const restaurant_entity_1 = require("../restaurants/restaurant.entity");
const meal_time_window_entity_1 = require("../meal-types/meal-time-window.entity");
const monthly_allowance_entity_1 = require("../monthly-allowances/monthly-allowance.entity");
const meal_consumption_entity_1 = require("../meal-consumptions/meal-consumption.entity");
let Tenant = class Tenant {
    id;
    name;
    cnpj;
    email;
    phone;
    isActive;
    createdAt;
    updatedAt;
    users;
    restaurants;
    mealTimeWindows;
    allowances;
    consumptions;
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "cnpj", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (u) => u.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => restaurant_entity_1.Restaurant, (r) => r.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "restaurants", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => meal_time_window_entity_1.MealTimeWindow, (m) => m.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "mealTimeWindows", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => monthly_allowance_entity_1.MonthlyAllowance, (a) => a.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "allowances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => meal_consumption_entity_1.MealConsumption, (c) => c.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "consumptions", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants')
], Tenant);
//# sourceMappingURL=tenant.entity.js.map