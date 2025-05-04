import { UserRole } from '../enums';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateUserContactDto {
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Details must be a string' })
  details?: string;
}

export class CreateUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Full name is required' })
  full_name: string;

  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role: UserRole;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @ValidateNested()
  @Type(() => CreateUserContactDto)
  contact: CreateUserContactDto;
}
