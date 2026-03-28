import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards,
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
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @Roles(UserRole.ROOT)
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles(UserRole.ROOT)
  create(@Body() dto: CreateTenantDto) { return this.service.create(dto); }

  @Put(':id')
  @Roles(UserRole.ROOT)
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ROOT)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
