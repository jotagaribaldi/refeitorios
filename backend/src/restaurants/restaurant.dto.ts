import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  // Usado apenas pelo ROOT para vincular a uma empresa específica
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
