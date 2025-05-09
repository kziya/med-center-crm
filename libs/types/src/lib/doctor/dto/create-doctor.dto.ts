import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto, UserRole } from '../../user';

export class CreateDoctorDetailsDto {
  @ApiPropertyOptional({
    description: 'Medical specialty of the doctor',
    example: 'Cardiology',
  })
  @IsString()
  @MaxLength(100)
  specialty: string;

  @ApiPropertyOptional({
    description: 'License number of the doctor',
    example: 'MD123456',
  })
  @IsString()
  @MaxLength(50)
  license_number: string;

  @ApiPropertyOptional({
    description: 'Educational background',
    example: 'Harvard Medical School',
  })
  @IsString()
  @MaxLength(255)
  education: string;

  @ApiPropertyOptional({
    description: 'Brief summary of career',
    example: 'Over 10 years of experience in general surgery.',
  })
  @IsString()
  career_summary: string;

  @ApiPropertyOptional({
    description: 'Availability in JSON format',
    example: { monday: ['09:00-12:00'], tuesday: ['13:00-17:00'] },
  })
  @IsOptional()
  @IsObject()
  availability?: Record<string, any>;
}

export class CreateDoctorDto extends CreateUserDto {
  @ApiHideProperty()
  override role: UserRole = UserRole.DOCTOR;

  @ApiProperty({
    description: 'Doctor details',
    type: CreateDoctorDetailsDto,
  })
  @Type(() => CreateDoctorDetailsDto)
  @IsNotEmpty()
  details: CreateDoctorDetailsDto;
}
