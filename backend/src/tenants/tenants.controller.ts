import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('tenants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TenantsController {
  constructor(private service: TenantsService) {}

  @Get()
  @Roles(UserRole.ROOT)
  findAll(@Request() req: any) { return this.service.findAll(req.user); }

  @Get(':id')
  @Roles(UserRole.ROOT)
  findOne(@Param('id') id: string, @Request() req: any) { return this.service.findOne(id, req.user); }

  @Post()
  @Roles(UserRole.ROOT)
  create(@Body() dto: CreateTenantDto, @Request() req: any) { return this.service.create(dto, req.user); }

  @Put(':id')
  @Roles(UserRole.ROOT)
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto, @Request() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ROOT)
  remove(@Param('id') id: string, @Request() req: any) { return this.service.remove(id, req.user); }
}
