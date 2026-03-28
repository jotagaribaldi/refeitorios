import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAllowanceDto {
  @IsString()
  userId: string;

  @IsInt()
  @Min(2020)
  year: number;

  @IsInt()
  @Min(1)
  month: number;

  @IsInt()
  @Min(0)
  totalAllowance: number;
}

export class UpdateAllowanceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  totalAllowance?: number;
}
