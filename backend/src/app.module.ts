import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MealTypesModule } from './meal-types/meal-types.module';
import { MealConsumptionsModule } from './meal-consumptions/meal-consumptions.module';
import { MonthlyAllowancesModule } from './monthly-allowances/monthly-allowances.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { Tenant } from './tenants/tenant.entity';
import { User } from './users/user.entity';
import { Restaurant } from './restaurants/restaurant.entity';
import { MealType } from './meal-types/meal-type.entity';
import { MealTimeWindow } from './meal-types/meal-time-window.entity';
import { MonthlyAllowance } from './monthly-allowances/monthly-allowance.entity';
import { MealConsumption } from './meal-consumptions/meal-consumption.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5432')),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASS', 'postgres'),
        database: config.get('DB_NAME', 'refeitorios'),
        entities: [
          Tenant, User, Restaurant, MealType,
          MealTimeWindow, MonthlyAllowance, MealConsumption,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    TenantsModule,
    UsersModule,
    RestaurantsModule,
    MealTypesModule,
    MealConsumptionsModule,
    MonthlyAllowancesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
