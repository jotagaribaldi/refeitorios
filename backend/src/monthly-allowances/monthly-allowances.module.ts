import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyAllowance } from './monthly-allowance.entity';
import { MonthlyAllowancesService } from './monthly-allowances.service';
import { MonthlyAllowancesController } from './monthly-allowances.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MonthlyAllowance, User])],
  providers: [MonthlyAllowancesService],
  controllers: [MonthlyAllowancesController],
  exports: [MonthlyAllowancesService],
})
export class MonthlyAllowancesModule {}
