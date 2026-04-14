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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../tenants/tenant.entity");
const monthly_allowance_entity_1 = require("../monthly-allowances/monthly-allowance.entity");
const meal_consumption_entity_1 = require("../meal-consumptions/meal-consumption.entity");
const restaurant_entity_1 = require("../restaurants/restaurant.entity");
var UserRole;
(function (UserRole) {
    UserRole["ROOT"] = "ROOT";
    UserRole["GERENTE"] = "GERENTE";
    UserRole["FUNCIONARIO"] = "FUNCIONARIO";
    UserRole["FISCAL"] = "FISCAL";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
    id;
    tenantId;
    tenant;
    name;
    email;
    passwordHash;
    role;
    employeeCode;
    qrCodeToken;
    isActive;
    createdAt;
    updatedAt;
    allowances;
    consumptions;
    allowedRestaurants;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { nullable: true, onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], User.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: UserRole, default: UserRole.FUNCIONARIO }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_code', length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "employeeCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_code_token', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "qrCodeToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => monthly_allowance_entity_1.MonthlyAllowance, (a) => a.user),
    __metadata("design:type", Array)
], User.prototype, "allowances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => meal_consumption_entity_1.MealConsumption, (c) => c.user),
    __metadata("design:type", Array)
], User.prototype, "consumptions", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => restaurant_entity_1.Restaurant, { eager: false, cascade: false }),
    (0, typeorm_1.JoinTable)({
        name: 'user_allowed_restaurants',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], User.prototype, "allowedRestaurants", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map