import { IsOptional, IsString } from 'class-validator';

export class RegisterConsumptionDto {
  @IsString()
  qrCodeToken: string;   // token do QR Code do refeitório

  @IsOptional()
  @IsString()
  notes?: string;
}
