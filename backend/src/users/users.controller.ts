import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from './user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  findAll(@Request() req: any, @Query('tenantId') tenantId?: string) {
    const tid = req.user.role === UserRole.GERENTE ? req.user.tenantId : tenantId;
    return this.service.findAll(tid);
  }

  @Get(':id')
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  // Retorna os dados do código de barras do funcionário
  // Acessível pelo próprio usuário, FISCAL e GERENTE do mesmo tenant
  @Get(':id/barcode')
  async getUserBarcode(@Param('id') id: string, @Request() req: any) {
    const caller = req.user;
    if (caller.role !== UserRole.ROOT) {
      const target = await this.service.findOne(id);
      if (target.tenantId !== caller.tenantId && caller.id !== id) {
        throw new ForbiddenException('Acesso negado');
      }
    }
    return this.service.getUserBarcodeData(id);
  }

  // Alias de retrocompatibilidade com mobile
  @Get(':id/qrcode')
  async getUserQrCodeAlias(@Param('id') id: string, @Request() req: any) {
    const caller = req.user;
    if (caller.role !== UserRole.ROOT) {
      const target = await this.service.findOne(id);
      if (target.tenantId !== caller.tenantId && caller.id !== id) {
        throw new ForbiddenException('Acesso negado');
      }
    }
    return this.service.getUserBarcodeData(id);
  }

  @Post(':id/regenerate-barcode')
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  async regenerateUserBarcode(@Param('id') id: string, @Request() req: any) {
    const caller = req.user;
    if (caller.role !== UserRole.ROOT) {
      const target = await this.service.findOne(id);
      if (target.tenantId !== caller.tenantId) {
        throw new ForbiddenException('Acesso negado');
      }
    }
    return this.service.regenerateUserBarcode(id);
  }

  // Alias de retrocompatibilidade
  @Post(':id/regenerate-qr')
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  async regenerateUserQrAlias(@Param('id') id: string, @Request() req: any) {
    const caller = req.user;
    if (caller.role !== UserRole.ROOT) {
      const target = await this.service.findOne(id);
      if (target.tenantId !== caller.tenantId) {
        throw new ForbiddenException('Acesso negado');
      }
    }
    return this.service.regenerateUserBarcode(id);
  }

  @Post()
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  create(@Body() dto: CreateUserDto, @Request() req: any) {
    return this.service.create(dto, req.user);
  }

  @Put(':id')
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ROOT, UserRole.GERENTE)
  remove(@Param('id') id: string, @Request() req: any) { return this.service.remove(id, req.user); }
}
