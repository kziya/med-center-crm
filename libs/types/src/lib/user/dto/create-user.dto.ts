import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { UserRole } from '../enums';

export class CreateUserContactDto {
  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+380991112233',
  })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @ApiPropertyOptional({
    description: 'User address',
    example: '123 Main St, Kyiv',
  })
  @IsString({ message: 'Address must be a string' })
  address: string;

  @ApiPropertyOptional({
    description: 'Additional details',
    example: 'Has allergies',
  })
  @IsOptional()
  @IsString({ message: 'Details must be a string' })
  details?: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsNotEmpty({ message: 'Full name is required' })
  full_name: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Role of the user',
    example: UserRole.PATIENT,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role: UserRole;

  @ApiProperty({ description: 'Account password', example: 'StrongPass123!' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @ApiProperty({ type: () => CreateUserContactDto })
  @IsDefined({ message: 'Contact must be provided' })
  @ValidateNested()
  @Type(() => CreateUserContactDto)
  contact: CreateUserContactDto;
}
