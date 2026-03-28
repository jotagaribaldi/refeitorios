"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealTypesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const meal_type_entity_1 = require("./meal-type.entity");
const meal_time_window_entity_1 = require("./meal-time-window.entity");
const meal_types_service_1 = require("./meal-types.service");
const meal_types_controller_1 = require("./meal-types.controller");
let MealTypesModule = class MealTypesModule {
};
exports.MealTypesModule = MealTypesModule;
exports.MealTypesModule = MealTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([meal_type_entity_1.MealType, meal_time_window_entity_1.MealTimeWindow])],
        providers: [meal_types_service_1.MealTypesService],
        controllers: [meal_types_controller_1.MealTypesController],
        exports: [meal_types_service_1.MealTypesService],
    })
], MealTypesModule);
//# sourceMappingURL=meal-types.module.js.map