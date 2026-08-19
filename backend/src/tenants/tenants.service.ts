import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private repo: Repository<Tenant>,
    private telegramService: TelegramService,
  ) {}

  async findAll(currentUser?: any) {
    this.telegramService.sendMessage(
      `🔍 <b>Consulta de Empresas</b>\n` +
      `📋 <b>Ação:</b> Listagem de todas as empresas\n` +
      `👤 <b>Consultado por:</b> ${currentUser?.email || 'Sistema'}`
    );
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string, currentUser?: any) {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Empresa não encontrada');
    
    this.telegramService.sendMessage(
      `🔍 <b>Consulta de Empresa</b>\n` +
      `🏢 <b>Empresa:</b> ${tenant.name}\n` +
      `👤 <b>Consultado por:</b> ${currentUser?.email || 'Sistema'}`
    );
    return tenant;
  }

  async create(dto: CreateTenantDto, currentUser?: any) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email já cadastrado');
    const tenant = this.repo.create(dto);
    const saved = await this.repo.save(tenant);

    this.telegramService.sendMessage(
      `🏢 <b>Empresa Cadastrada</b>\n` +
      `🏢 <b>Nome:</b> ${saved.name}\n` +
      `📧 <b>E-mail:</b> ${saved.email}\n` +
      `👤 <b>Criado por:</b> ${currentUser?.email || 'Sistema'}`
    );
    return saved;
  }

  async update(id: string, dto: UpdateTenantDto, currentUser?: any) {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Empresa não encontrada');
    Object.assign(tenant, dto);
    const saved = await this.repo.save(tenant);

    this.telegramService.sendMessage(
      `🏢 <b>Empresa Atualizada</b>\n` +
      `🏢 <b>Nome:</b> ${saved.name}\n` +
      `📧 <b>E-mail:</b> ${saved.email}\n` +
      `👤 <b>Atualizado por:</b> ${currentUser?.email || 'Sistema'}`
    );
    return saved;
  }

  async remove(id: string, currentUser?: any) {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Empresa não encontrada');
    tenant.isActive = false;
    const saved = await this.repo.save(tenant);

    this.telegramService.sendMessage(
      `🏢 <b>Empresa Desativada/Excluída</b>\n` +
      `🏢 <b>Nome:</b> ${saved.name}\n` +
      `📧 <b>E-mail:</b> ${saved.email}\n` +
      `👤 <b>Excluído por:</b> ${currentUser?.email || 'Sistema'}`
    );
    return saved;
  }
}
