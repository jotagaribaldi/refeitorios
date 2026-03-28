import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/user.entity';

export const ROLES_KEY = 'roles';

export function Roles(...roles: UserRole[]): MethodDecorator & ClassDecorator {
  return (target: any, key?: string | symbol, descriptor?: any) => {
    const metadata = Reflect.getMetadata('design:type', target, key as string) ?? {};
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor ? descriptor.value : target);
    return descriptor ?? target;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Acesso negado');

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) throw new ForbiddenException('Permissão insuficiente');
    return true;
  }
}
