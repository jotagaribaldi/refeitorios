"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyAllowancesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const monthly_allowance_entity_1 = require("./monthly-allowance.entity");
const monthly_allowances_service_1 = require("./monthly-allowances.service");
const monthly_allowances_controller_1 = require("./monthly-allowances.controller");
const user_entity_1 = require("../users/user.entity");
let MonthlyAllowancesModule = class MonthlyAllowancesModule {
};
exports.MonthlyAllowancesModule = MonthlyAllowancesModule;
exports.MonthlyAllowancesModule = MonthlyAllowancesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([monthly_allowance_entity_1.MonthlyAllowance, user_entity_1.User])],
        providers: [monthly_allowances_service_1.MonthlyAllowancesService],
        controllers: [monthly_allowances_controller_1.MonthlyAllowancesController],
        exports: [monthly_allowances_service_1.MonthlyAllowancesService],
    })
], MonthlyAllowancesModule);
//# sourceMappingURL=monthly-allowances.module.js.map