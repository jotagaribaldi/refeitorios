import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MonthlyAllowance } from './monthly-allowance.entity';
import { CreateAllowanceDto, UpdateAllowanceDto, CreateBatchAllowanceDto } from './monthly-allowance.dto';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class MonthlyAllowancesService {
  constructor(
    @InjectRepository(MonthlyAllowance) private repo: Repository<MonthlyAllowance>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll(tenantId?: string, year?: number, month?: number) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (year) where.year = year;
    if (month) where.month = month;
    return this.repo.find({
      where,
      relations: ['user', 'user.tenant'],
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async findForUser(userId: string, year: number, month: number) {
    return this.repo.findOne({ where: { userId, year, month } });
  }

  async create(dto: CreateAllowanceDto, callerTenantId?: string) {
    // Se o chamador é ROOT (sem tenantId), busca o tenant do usuário-alvo automaticamente
    let tenantId = callerTenantId;
    if (!tenantId) {
      const targetUser = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!targetUser) throw new NotFoundException('Usuário não encontrado');
      tenantId = targetUser.tenantId;
    }

    const exists = await this.repo.findOne({
      where: { userId: dto.userId, year: dto.year, month: dto.month },
    });
    if (exists) throw new ConflictException('Saldo já cadastrado para este período');

    const a = this.repo.create({ ...dto, tenantId, consumed: 0 });
    const saved = await this.repo.save(a);
    return this.repo.findOne({ where: { id: saved.id }, relations: ['user'] });
  }

  async createBatch(dto: CreateBatchAllowanceDto, callerTenantId?: string) {
    const targetTenantId = callerTenantId || dto.tenantId;
    const where: any = { isActive: true };
    if (targetTenantId) {
      where.tenantId = targetTenantId;
    }
    where.role = In([UserRole.FUNCIONARIO, UserRole.FISCAL, UserRole.GERENTE, UserRole.VISITANTE]);

    const users = await this.userRepo.find({ where });
    if (users.length === 0) {
      throw new NotFoundException('Nenhum funcionário ativo encontrado para o critério selecionado');
    }

    let created = 0;
    let updated = 0;

    for (const user of users) {
      const existing = await this.repo.findOne({
        where: { userId: user.id, year: dto.year, month: dto.month },
      });

      if (existing) {
        existing.totalAllowance = Math.max(dto.totalAllowance, existing.consumed);
        await this.repo.save(existing);
        updated++;
      } else {
        const allowance = this.repo.create({
          userId: user.id,
          tenantId: user.tenantId,
          year: dto.year,
          month: dto.month,
          totalAllowance: dto.totalAllowance,
          consumed: 0,
        });
        await this.repo.save(allowance);
        created++;
      }
    }

    return {
      message: `Saldo atribuído com sucesso para ${users.length} funcionário(s). (${created} novo(s), ${updated} atualizado(s))`,
      count: users.length,
      created,
      updated,
    };
  }

  async update(id: string, tenantId: string | undefined, dto: UpdateAllowanceDto) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const a = await this.repo.findOne({ where });
    if (!a) throw new NotFoundException('Saldo não encontrado');
    Object.assign(a, dto);
    return this.repo.save(a);
  }

  async incrementConsumed(userId: string, year: number, month: number): Promise<MonthlyAllowance> {
    const allowance = await this.findForUser(userId, year, month);
    if (!allowance) throw new NotFoundException('Saldo mensal não configurado');
    if (allowance.consumed >= allowance.totalAllowance) {
      throw new Error('Saldo esgotado');
    }
    allowance.consumed += 1;
    return this.repo.save(allowance);
  }
}

