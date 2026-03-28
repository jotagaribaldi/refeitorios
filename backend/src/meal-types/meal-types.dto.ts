import { IsBoolean, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateTimeWindowDto {
  @IsString()
  restaurantId: string;

  @IsString()
  mealTypeId: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Formato HH:MM' })
  startTime: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Formato HH:MM' })
  endTime: string;

  @IsOptional()
  @IsBoolean()
  allowDuplicate?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateMealTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
