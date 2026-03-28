"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const tenants_module_1 = require("./tenants/tenants.module");
const users_module_1 = require("./users/users.module");
const restaurants_module_1 = require("./restaurants/restaurants.module");
const meal_types_module_1 = require("./meal-types/meal-types.module");
const meal_consumptions_module_1 = require("./meal-consumptions/meal-consumptions.module");
const monthly_allowances_module_1 = require("./monthly-allowances/monthly-allowances.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const tenant_entity_1 = require("./tenants/tenant.entity");
const user_entity_1 = require("./users/user.entity");
const restaurant_entity_1 = require("./restaurants/restaurant.entity");
const meal_type_entity_1 = require("./meal-types/meal-type.entity");
const meal_time_window_entity_1 = require("./meal-types/meal-time-window.entity");
const monthly_allowance_entity_1 = require("./monthly-allowances/monthly-allowance.entity");
const meal_consumption_entity_1 = require("./meal-consumptions/meal-consumption.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: parseInt(config.get('DB_PORT', '5432')),
                    username: config.get('DB_USER', 'postgres'),
                    password: config.get('DB_PASS', 'postgres'),
                    database: config.get('DB_NAME', 'refeitorios'),
                    entities: [
                        tenant_entity_1.Tenant, user_entity_1.User, restaurant_entity_1.Restaurant, meal_type_entity_1.MealType,
                        meal_time_window_entity_1.MealTimeWindow, monthly_allowance_entity_1.MonthlyAllowance, meal_consumption_entity_1.MealConsumption,
                    ],
                    synchronize: config.get('NODE_ENV') !== 'production',
                    logging: config.get('NODE_ENV') === 'development',
                }),
            }),
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            restaurants_module_1.RestaurantsModule,
            meal_types_module_1.MealTypesModule,
            meal_consumptions_module_1.MealConsumptionsModule,
            monthly_allowances_module_1.MonthlyAllowancesModule,
            dashboard_module_1.DashboardModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map