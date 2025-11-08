import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';

export enum EmployeeRole {
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  CASHIER = 'CASHIER',
  WAREHOUSE = 'WAREHOUSE',
}

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(EmployeeRole)
  @IsNotEmpty()
  role: EmployeeRole;

  @IsString()
  @IsOptional()
  address?: string;
}
