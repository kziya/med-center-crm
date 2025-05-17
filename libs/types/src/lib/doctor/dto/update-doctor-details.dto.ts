import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoctorDetailsDto {
  @ApiPropertyOptional({
    description: 'Medical specialty of the doctor',
    example: 'Cardiology',
  })
  @IsOptional()
  @IsString({ message: 'Specialty must be a string' })
  specialty?: string;

  @ApiPropertyOptional({
    description: 'License number of the doctor',
    example: 'MD123456',
  })
  @IsOptional()
  @IsString({ message: 'License number must be a string' })
  license_number?: string;

  @ApiPropertyOptional({
    description: 'Educational background of the doctor',
    example: 'Harvard Medical School',
  })
  @IsOptional()
  @IsString({ message: 'Education must be a string' })
  education?: string;

  @ApiPropertyOptional({
    description: 'Summary of career experience',
    example: 'Over 10 years of experience in general surgery.',
  })
  @IsOptional()
  @IsString({ message: 'Career summary must be a string' })
  career_summary?: string;

  @ApiPropertyOptional({
    description: 'Availability schedule as JSON object',
    example: {
      monday: ['09:00-12:00', '14:00-17:00'],
      tuesday: ['10:00-13:00'],
    },
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Availability must be a valid JSON object' })
  availability?: Record<string, any>;
}
