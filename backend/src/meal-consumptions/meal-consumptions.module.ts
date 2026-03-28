import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealConsumption } from './meal-consumption.entity';
import { MealConsumptionsService } from './meal-consumptions.service';
import { MealConsumptionsController } from './meal-consumptions.controller';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MealTypesModule } from '../meal-types/meal-types.module';
import { MonthlyAllowancesModule } from '../monthly-allowances/monthly-allowances.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealConsumption]),
    RestaurantsModule,
    MealTypesModule,
    MonthlyAllowancesModule,
    UsersModule,
  ],
  providers: [MealConsumptionsService],
  controllers: [MealConsumptionsController],
  exports: [MealConsumptionsService],
})
export class MealConsumptionsModule {}
