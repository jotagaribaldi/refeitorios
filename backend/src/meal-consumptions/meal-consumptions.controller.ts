import {
  Controller, Get, Post, Body, UseGuards, Request, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsUUID, IsOptional } from 'class-validator';
import { MealConsumptionsService } from './meal-consumptions.service';
import { RegisterConsumptionDto } from './meal-consumption.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

class ScanUserQrDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller('consumptions')
@UseGuards(AuthGuard('jwt'))
export class MealConsumptionsController {
  constructor(private service: MealConsumptionsService) {}

  // FISCAL escaneia o QR Code do crachá do funcionário e registra o consumo
  @Post('scan')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FISCAL)
  scanEmployee(@Body() dto: ScanUserQrDto, @Request() req: any) {
    return this.service.registerByFiscal(req.user.id, req.user.tenantId, dto.userId, dto.notes);
  }

  // Funcionário escaneia QR e registra consumo (legado - mantido por compatibilidade)
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
