import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { User, UserRole } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Restaurant } from '../restaurants/restaurant.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Restaurant) private restaurantRepo: Repository<Restaurant>,
  ) {}

  async findAll(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    const users = await this.repo.find({
      where,
      relations: ['tenant', 'allowedRestaurants'],
      order: { name: 'ASC' },
    });
    // Remove passwordHash de cada usuário antes de retornar
    return users.map(({ passwordHash: _, ...u }) => u);
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['tenant', 'allowedRestaurants'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const { passwordHash: _, ...result } = user as any;
    return result;
  }

  async create(dto: CreateUserDto, currentUser: any) {
    // ROOT may specify tenantId; GERENTE always uses own tenantId
    if (currentUser.role === UserRole.GERENTE) {
      if (dto.role !== UserRole.FUNCIONARIO && dto.role !== UserRole.FISCAL) {
        throw new ForbiddenException('Gerente só pode criar funcionários ou fiscais');
      }
      dto.tenantId = currentUser.tenantId;
    }

    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email já cadastrado');

    const { password, allowedRestaurantIds, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, 10);
    const qrCodeToken = (dto.role === UserRole.FUNCIONARIO || dto.role === UserRole.FISCAL)
      ? uuidv4()
      : null;
    const user = this.repo.create({ ...rest, passwordHash, qrCodeToken });

    // Vincula refeitórios permitidos (apenas para FUNCIONARIO)
    if (allowedRestaurantIds?.length && dto.role === UserRole.FUNCIONARIO) {
      user.allowedRestaurants = await this.restaurantRepo.findBy({
        id: In(allowedRestaurantIds),
      });
    } else {
      user.allowedRestaurants = [];
    }

    const saved = await this.repo.save(user);
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
      const allowedRoles = [UserRole.FUNCIONARIO, UserRole.FISCAL];
      const isSelfGerente = user.id === currentUser.id && dto.role === UserRole.GERENTE;
      if (!allowedRoles.includes(dto.role as UserRole) && !isSelfGerente) {
        throw new ForbiddenException('Gerente só pode gerenciar perfis de funcionários e fiscais');
      }
    }

    // Segurança: Gerente não pode mudar a empresa do funcionário
    if (currentUser.role === UserRole.GERENTE && dto.tenantId && dto.tenantId !== currentUser.tenantId) {
       throw new ForbiddenException('Gerente não pode alterar a empresa do usuário');
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
    const { passwordHash: _, ...result } = saved as any;
    return result;
  }

  async remove(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    user.isActive = false;
    return this.repo.save(user);
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

  // Retorna os dados para gerar QR Code do funcionário
  async getUserQrData(userId: string) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (!user.qrCodeToken) {
      user.qrCodeToken = uuidv4();
      await this.repo.save(user);
    }
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({ userId: user.id, token: user.qrCodeToken }),
    );
    return {
      userId: user.id,
      qrCodeToken: user.qrCodeToken,
      qrDataUrl,
      userName: user.name,
      employeeCode: user.employeeCode,
      tenantName: user.tenant?.name || '',
    };
  }

  async regenerateUserQr(userId: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    user.qrCodeToken = uuidv4();
    await this.repo.save(user);
    return this.getUserQrData(userId);
  }

  async findByQrToken(token: string) {
    const user = await this.repo.findOne({
      where: { qrCodeToken: token, isActive: true },
      relations: ['tenant'],
    });
    if (!user) throw new NotFoundException('QR Code inválido');
    return user;
  }

  async findByQrTokenForFiscal(userId: string) {
    const user = await this.repo.findOne({
      where: { id: userId, isActive: true },
      relations: ['tenant'],
    });
    if (!user) throw new NotFoundException('Funcionário não encontrado');
    if (!user.qrCodeToken) {
      throw new NotFoundException('Funcionário não possui QR Code');
    }
    return user;
  }

  async seedRoot() {
    const exists = await this.repo.findOne({ where: { email: 'root@refeitorios.com' } });
    if (exists) return;
    const passwordHash = await bcrypt.hash('root@123', 10);
    await this.repo.save(this.repo.create({
      name: 'Super Admin',
      email: 'root@refeitorios.com',
      passwordHash,
      role: UserRole.ROOT,
    }));
    console.log('✅ ROOT user seeded: root@refeitorios.com / root@123');
  }
}
