import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';
import { MonthlyAllowance } from '../monthly-allowances/monthly-allowance.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealConsumption, MonthlyAllowance])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
