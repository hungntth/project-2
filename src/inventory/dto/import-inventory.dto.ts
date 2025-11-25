import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class ImportInventoryDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ValidateIf((o) => o.productId === 'new')
  @IsString()
  @IsNotEmpty()
  productName?: string; // Tên sản phẩm mới nếu chưa có (chỉ bắt buộc khi productId === 'new')

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  supplierId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
