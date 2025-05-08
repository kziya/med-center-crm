import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../enums';

export class UpdateUserGeneralDto {
  @ApiPropertyOptional({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Full name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiPropertyOptional({
    description: 'New password (only for admin use)',
    example: 'StrongP@ss123',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: 'User status', enum: UserStatus })
  @IsEnum(UserStatus, { message: 'Status must be a valid enum value' })
  @IsOptional()
  status?: UserStatus;
}

export class UpdateUserContactDto {
  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+380991112233',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Address', example: '123 Main St, Kyiv' })
  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Additional contact details',
    example: 'Lives in a green house on the right.',
  })
  @IsString({ message: 'Details must be a string' })
  @IsOptional()
  details?: string;
}
