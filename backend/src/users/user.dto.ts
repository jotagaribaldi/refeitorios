import {
  IsEmail, IsEnum, IsOptional, IsString, MinLength, IsArray, IsUUID,
} from 'class-validator';
import { UserRole } from './user.entity';

export class CreateUserDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  employeeCode?: string;

  // IDs dos refeitórios onde o funcionário pode realizar refeições
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  allowedRestaurantIds?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  allowedRestaurantIds?: string[];
}
