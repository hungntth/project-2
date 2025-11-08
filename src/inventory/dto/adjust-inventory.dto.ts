import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AdjustInventoryDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
