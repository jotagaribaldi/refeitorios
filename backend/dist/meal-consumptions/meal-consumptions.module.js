"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealConsumptionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const meal_consumption_entity_1 = require("./meal-consumption.entity");
const meal_consumptions_service_1 = require("./meal-consumptions.service");
const meal_consumptions_controller_1 = require("./meal-consumptions.controller");
const restaurants_module_1 = require("../restaurants/restaurants.module");
const meal_types_module_1 = require("../meal-types/meal-types.module");
const monthly_allowances_module_1 = require("../monthly-allowances/monthly-allowances.module");
const users_module_1 = require("../users/users.module");
let MealConsumptionsModule = class MealConsumptionsModule {
};
exports.MealConsumptionsModule = MealConsumptionsModule;
exports.MealConsumptionsModule = MealConsumptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([meal_consumption_entity_1.MealConsumption]),
            restaurants_module_1.RestaurantsModule,
            meal_types_module_1.MealTypesModule,
            monthly_allowances_module_1.MonthlyAllowancesModule,
            users_module_1.UsersModule,
        ],
        providers: [meal_consumptions_service_1.MealConsumptionsService],
        controllers: [meal_consumptions_controller_1.MealConsumptionsController],
        exports: [meal_consumptions_service_1.MealConsumptionsService],
    })
], MealConsumptionsModule);
//# sourceMappingURL=meal-consumptions.module.js.map