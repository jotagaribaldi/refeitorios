import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealType } from './meal-type.entity';
import { MealTimeWindow } from './meal-time-window.entity';
import { MealTypesService } from './meal-types.service';
import { MealTypesController } from './meal-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealType, MealTimeWindow])],
  providers: [MealTypesService],
  controllers: [MealTypesController],
  exports: [MealTypesService],
})
export class MealTypesModule {}
