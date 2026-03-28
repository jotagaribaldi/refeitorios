import {
  Controller, Get, Post, Put, Param, Body, UseGuards, Request, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MonthlyAllowancesService } from './monthly-allowances.service';
import { CreateAllowanceDto, UpdateAllowanceDto } from './monthly-allowance.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('allowances')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MonthlyAllowancesController {
  constructor(private service: MonthlyAllowancesService) {}

  @Get()
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  findAll(
    @Request() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    // ROOT vê todos (sem filtro de tenant); GERENTE só vê do seu tenant
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.findAll(
      tenantId,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @Post()
  @Roles(UserRole.GERENTE, UserRole.ROOT)
  create(@Body() dto: CreateAllowanceDto, @Request() req: any) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.create(dto, tenantId);
  }

  @Put(':id')
  @Roles(UserRole.GERENTE, UserRole.ROOT)
  update(@Param('id') id: string, @Body() dto: UpdateAllowanceDto, @Request() req: any) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.update(id, tenantId, dto);
  }
}
