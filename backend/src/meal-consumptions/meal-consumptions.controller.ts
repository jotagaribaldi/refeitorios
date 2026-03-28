import {
  Controller, Get, Post, Body, UseGuards, Request, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MealConsumptionsService } from './meal-consumptions.service';
import { RegisterConsumptionDto } from './meal-consumption.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('consumptions')
@UseGuards(AuthGuard('jwt'))
export class MealConsumptionsController {
  constructor(private service: MealConsumptionsService) {}

  // Funcionário escaneia QR e registra consumo
  @Post()
  register(@Body() dto: RegisterConsumptionDto, @Request() req: any) {
    return this.service.register(req.user.id, req.user.tenantId, dto);
  }

  // Funcionário vê seus próprios consumos
  @Get('me')
  myConsumptions(@Request() req: any) {
    return this.service.findMyConsumptions(req.user.id);
  }

  // Gerente/ROOT vê todos os consumos com filtros
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  findAll(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.findAll(tenantId, { userId, restaurantId, startDate, endDate });
  }
}
