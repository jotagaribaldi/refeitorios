import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MealTypesService } from './meal-types.service';
import { CreateMealTypeDto, UpdateTimeWindowDto } from './meal-types.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('meal-types')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MealTypesController {
  constructor(private service: MealTypesService) {}

  @Get()
  @Roles(UserRole.GERENTE)
  findAll(@Request() req: any) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.findAll(tenantId);
  }

  @Post()
  @Roles(UserRole.GERENTE)
  create(@Body() dto: CreateMealTypeDto, @Request() req: any) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.createType(tenantId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.GERENTE)
  remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.removeType(id, tenantId);
  }

  @Get('time-windows')
  @Roles(UserRole.GERENTE)
  getWindows(@Query('restaurantId') restaurantId: string) {
    return this.service.getWindowsForRestaurant(restaurantId);
  }

  @Put('time-windows')
  @Roles(UserRole.GERENTE)
  upsertWindow(@Body() dto: UpdateTimeWindowDto, @Request() req: any) {
    // tenantId é usado apenas no momento de criar o registro (para indicar domínio)
    return this.service.upsertWindow(req.user.tenantId, dto);
  }
}
