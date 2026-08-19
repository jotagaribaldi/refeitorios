import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private telegramService: TelegramService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({
      where: { email, isActive: true },
      relations: ['tenant'],
    });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    this.telegramService.sendMessage(
      `🔑 <b>Login Efetuado</b>\n` +
      `👤 <b>Usuário:</b> ${user.name} (${user.email})\n` +
      `💼 <b>Cargo:</b> ${user.role}\n` +
      `🏢 <b>Empresa:</b> ${user.tenant?.name || 'N/A'}`
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant,
      },
    };
  }

  async logout(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });
    if (user) {
      this.telegramService.sendMessage(
        `🚪 <b>Logout Efetuado</b>\n` +
        `👤 <b>Usuário:</b> ${user.name} (${user.email})\n` +
        `💼 <b>Cargo:</b> ${user.role}\n` +
        `🏢 <b>Empresa:</b> ${user.tenant?.name || 'N/A'}`
      );
    }
    return { success: true };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
