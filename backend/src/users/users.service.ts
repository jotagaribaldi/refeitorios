import {
  Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { User, UserRole } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Restaurant } from '../restaurants/restaurant.entity';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Restaurant) private restaurantRepo: Repository<Restaurant>,
    private telegramService: TelegramService,
  ) {}

  // Gera token numérico único de 8 dígitos (Code 128C — muito mais compacto que UUID)
  private async generateUniqueBarcodeToken(): Promise<string> {
    let token: string;
    let exists: User | null;
    do {
      // 8 dígitos: 10.000.000 a 99.999.999 (garante sempre 8 dígitos)
      token = String(randomInt(10_000_000, 100_000_000));
      exists = await this.repo.findOne({ where: { barcodeToken: token } });
    } while (exists);
    return token;
  }
  async findAll(tenantId?: string, currentUser?: any) {
    const where = tenantId ? { tenantId } : {};
    const users = await this.repo.find({
      where,
      relations: ['tenant', 'allowedRestaurants'],
      order: { name: 'ASC' },
    });
    
    this.telegramService.sendMessage(
      `🔍 <b>Consulta de Usuários</b>\n` +
      `📋 <b>Ação:</b> Listagem de usuários\n` +
      `👤 <b>Consultado por:</b> ${currentUser?.email || 'Sistema'}`
    );

    // Remove passwordHash de cada usuário antes de retornar
    return users.map(({ passwordHash: _, ...u }) => u);
  }

  async findOne(id: string, currentUser?: any) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['tenant', 'allowedRestaurants'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    this.telegramService.sendMessage(
      `🔍 <b>Consulta de Usuário</b>\n` +
      `👤 <b>Usuário:</b> ${user.name} (${user.email})\n` +
      `👤 <b>Consultado por:</b> ${currentUser?.email || 'Sistema'}`
    );

    const { passwordHash: _, ...result } = user as any;
    return result;
  }

  async create(dto: CreateUserDto, currentUser: any) {
    // ROOT may specify tenantId; GERENTE always uses own tenantId
    if (currentUser.role === UserRole.GERENTE) {
      if (dto.role !== UserRole.FUNCIONARIO && dto.role !== UserRole.FISCAL && dto.role !== UserRole.VISITANTE && dto.role !== UserRole.FORNECEDOR) {
        throw new ForbiddenException('Gerente só pode criar funcionários, fiscais, visitantes ou fornecedores');
      }
      dto.tenantId = currentUser.tenantId;
    }

    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email já cadastrado');

    if (dto.employeeCode) {
      const codeExists = await this.repo.findOne({ where: { employeeCode: dto.employeeCode } });
      if (codeExists) {
        throw new ConflictException('Matrícula (Código de Funcionário) já cadastrada');
      }
    }

    const { password, allowedRestaurantIds, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, 10);
    const barcodeToken = (dto.role === UserRole.FUNCIONARIO || dto.role === UserRole.FISCAL || dto.role === UserRole.GERENTE || dto.role === UserRole.VISITANTE)
      ? await this.generateUniqueBarcodeToken()
      : null;
    const user = this.repo.create({ ...rest, passwordHash, barcodeToken });

    // Vincula refeitórios permitidos (apenas para FUNCIONARIO e VISITANTE)
    if (allowedRestaurantIds?.length && (dto.role === UserRole.FUNCIONARIO || dto.role === UserRole.VISITANTE)) {
      user.allowedRestaurants = await this.restaurantRepo.findBy({
        id: In(allowedRestaurantIds),
      });
    } else {
      user.allowedRestaurants = [];
    }

    const saved = await this.repo.save(user);
    
    const savedWithRelation = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['tenant'],
    });
    
    if (savedWithRelation) {
      this.telegramService.sendMessage(
        `👤 <b>Usuário Cadastrado</b>\n` +
        `👤 <b>Nome:</b> ${savedWithRelation.name}\n` +
        `📧 <b>E-mail:</b> ${savedWithRelation.email}\n` +
        `💼 <b>Cargo:</b> ${savedWithRelation.role}\n` +
        `🏢 <b>Empresa:</b> ${savedWithRelation.tenant?.name || 'N/A'}\n` +
        `👤 <b>Criado por:</b> ${currentUser?.email || 'Sistema'}`
      );
    }

    const { passwordHash: __, ...result } = saved as any;
    return result;
  }

  async update(id: string, dto: UpdateUserDto, currentUser: any) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['allowedRestaurants'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (currentUser.role === UserRole.GERENTE && user.tenantId !== currentUser.tenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    // Segurança: Gerente não pode dar permissão de ROOT ou outro GERENTE para ninguém
    if (currentUser.role === UserRole.GERENTE && dto.role) {
      const allowedRoles = [UserRole.FUNCIONARIO, UserRole.FISCAL, UserRole.VISITANTE, UserRole.FORNECEDOR];
      const isSelfGerente = user.id === currentUser.id && dto.role === UserRole.GERENTE;
      if (!allowedRoles.includes(dto.role as UserRole) && !isSelfGerente) {
        throw new ForbiddenException('Gerente só pode gerenciar perfis de funcionários, fiscais, visitantes e fornecedores');
      }
    }

    // Segurança: Gerente não pode mudar a empresa do funcionário
    if (currentUser.role === UserRole.GERENTE && dto.tenantId && dto.tenantId !== currentUser.tenantId) {
       throw new ForbiddenException('Gerente não pode alterar a empresa do usuário');
    }

    if (dto.employeeCode) {
      const codeExists = await this.repo.findOne({ where: { employeeCode: dto.employeeCode } });
      if (codeExists && codeExists.id !== id) {
        throw new ConflictException('Matrícula (Código de Funcionário) já cadastrada');
      }
    }


    const { password, allowedRestaurantIds, ...rest } = dto as any;
    if (password) {
      (rest as any).passwordHash = await bcrypt.hash(password, 10);
    }
    Object.assign(user, rest);

    // Atualiza lista de refeitórios se fornecida
    if (allowedRestaurantIds !== undefined) {
      user.allowedRestaurants = allowedRestaurantIds.length
        ? await this.restaurantRepo.findBy({ id: In(allowedRestaurantIds) })
        : [];
    }

    const saved = await this.repo.save(user);

    const savedWithRelation = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['tenant'],
    });

    if (savedWithRelation) {
      this.telegramService.sendMessage(
        `👤 <b>Usuário Atualizado</b>\n` +
        `👤 <b>Nome:</b> ${savedWithRelation.name}\n` +
        `📧 <b>E-mail:</b> ${savedWithRelation.email}\n` +
        `💼 <b>Cargo:</b> ${savedWithRelation.role}\n` +
        `🏢 <b>Empresa:</b> ${savedWithRelation.tenant?.name || 'N/A'}\n` +
        `👤 <b>Atualizado por:</b> ${currentUser?.email || 'Sistema'}`
      );
    }

    const { passwordHash: _, ...result } = saved as any;
    return result;
  }

  async remove(id: string, currentUser: any) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    
    if (currentUser.role === UserRole.GERENTE) {
      if (user.tenantId !== currentUser.tenantId) {
        throw new ForbiddenException('Acesso negado');
      }
      if (user.role === UserRole.ROOT || (user.role === UserRole.GERENTE && user.id !== currentUser.id)) {
        throw new ForbiddenException('Gerente não pode excluir este perfil');
      }
    }
    
    user.isActive = false;
    const saved = await this.repo.save(user);

    this.telegramService.sendMessage(
      `👤 <b>Usuário Desativado/Excluído</b>\n` +
      `👤 <b>Nome:</b> ${saved.name}\n` +
      `📧 <b>E-mail:</b> ${saved.email}\n` +
      `💼 <b>Cargo:</b> ${saved.role}\n` +
      `👤 <b>Excluído por:</b> ${currentUser?.email || 'Sistema'}`
    );

    return saved;
  }

  // Retorna os refeitórios permitidos de um usuário (usado na validação de consumo)
  async getAllowedRestaurantIds(userId: string): Promise<string[]> {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['allowedRestaurants'],
    });
    if (!user) return [];
    if (!user.allowedRestaurants?.length) return []; // sem restrição = lista vazia = todos permitidos
    return user.allowedRestaurants.map((r) => r.id);
  }

  // Retorna os dados para gerar código de barras do funcionário (client-side)
  async getUserBarcodeData(userId: string, currentUser?: any) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    // Gera token curto se ainda não tem ou se ainda é um UUID longo (migração automática)
    const isUuid = user.barcodeToken && user.barcodeToken.includes('-');
    if (!user.barcodeToken || isUuid) {
      user.barcodeToken = await this.generateUniqueBarcodeToken();
      await this.repo.save(user);
    }

    if (currentUser) {
      this.telegramService.sendMessage(
        `🔍 <b>Visualização de Código de Barras / QR Code</b>\n` +
        `👤 <b>Usuário:</b> ${user.name} (${user.email})\n` +
        `👤 <b>Visualizado por:</b> ${currentUser.email || 'Sistema'}`
      );
    }

    return {
      userId: user.id,
      barcodeToken: user.barcodeToken,
      userName: user.name,
      employeeCode: user.employeeCode,
      tenantName: user.tenant?.name || '',
    };
  }

  async regenerateUserBarcode(userId: string, currentUser?: any) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    user.barcodeToken = await this.generateUniqueBarcodeToken();
    await this.repo.save(user);

    if (currentUser) {
      this.telegramService.sendMessage(
        `🔄 <b>Código de Barras / QR Code Regenerado</b>\n` +
        `👤 <b>Usuário:</b> ${user.name} (${user.email})\n` +
        `👤 <b>Regenerado por:</b> ${currentUser.email || 'Sistema'}`
      );
    }

    return this.getUserBarcodeData(userId);
  }

  async findByBarcodeToken(token: string) {
    const user = await this.repo.findOne({
      where: { barcodeToken: token, isActive: true },
      relations: ['tenant'],
    });
    if (!user) throw new NotFoundException('Código de barras inválido');
    return user;
  }

  async findByBarcodeTokenForFiscal(userId: string) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });
    if (!user) throw new NotFoundException('Funcionário não encontrado');
    if (!user.isActive) {
      throw new BadRequestException(`Funcionário ${user.name} está inativo e não pode utilizar o refeitório`);
    }
    if (!user.barcodeToken) {
      throw new NotFoundException('Funcionário não possui código de barras');
    }
    return user;
  }

  async seedRoot() {
    // Altera o tipo enum no Postgres de forma segura para garantir que VISITANTE e FORNECEDOR existam
    // dependendo de como foi criado (TypeORM usa users_role_enum por padrão, enquanto o script inicial usa user_role)
    const enumTypes = ['users_role_enum', 'user_role'];
    for (const enumType of enumTypes) {
      try {
        const typeExists = await this.repo.query(
          `SELECT 1 FROM pg_type WHERE typname = $1`,
          [enumType]
        );
        if (typeExists && typeExists.length > 0) {
          await this.repo.query(`ALTER TYPE ${enumType} ADD VALUE IF NOT EXISTS 'VISITANTE'`);
          await this.repo.query(`ALTER TYPE ${enumType} ADD VALUE IF NOT EXISTS 'FORNECEDOR'`);
        }
      } catch (e) {
        console.warn(`⚠️ Erro ao atualizar enum ${enumType}:`, e.message);
      }
    }

    const exists = await this.repo.findOne({ where: { email: 'root@refeitorios.com' } });
    if (exists) return;
    const passwordHash = await bcrypt.hash('Tocantins#159', 10);
    await this.repo.save(this.repo.create({
      name: 'Super Admin',
      email: 'root@refeitorios.com',
      passwordHash,
      role: UserRole.ROOT,
    }));
    console.log('✅ ROOT user seeded: root@refeitorios.com');
  }
}
