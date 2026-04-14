import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './restaurant.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('restaurants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RestaurantsController {
  constructor(private service: RestaurantsService) {}

  @Get()
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  findAll(@Request() req: any) {
    // ROOT vê todos OS refeitórios; GERENTE vê apenas os do seu tenant
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  create(@Body() dto: CreateRestaurantDto, @Request() req: any) {
    // GERENTE usa o tenantId do próprio perfil
    // ROOT deve fornecer tenantId no body
    const tenantId = req.user.role === UserRole.ROOT
      ? dto.tenantId
      : req.user.tenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Informe a empresa (tenantId) para criar o refeitório',
      );
    }
    return this.service.create(dto, tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  update(@Param('id') id: string, @Body() dto: UpdateRestaurantDto, @Request() req: any) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.role === UserRole.ROOT ? undefined : req.user.tenantId;
    return this.service.remove(id, tenantId);
  }
}
