import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdatePatientDetailsDto {
  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-05-10',
    type: String,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' }
  )
  dob?: string;

  @ApiPropertyOptional({
    description: 'Insurance provider name',
    example: 'BlueCross Health Insurance',
  })
  @IsOptional()
  @IsString({ message: 'Insurance provider must be a string' })
  insurance_provider?: string;

  @ApiPropertyOptional({
    description: 'List of allergies',
    example: ['Peanuts', 'Penicillin'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Allergies must be an array of strings' })
  @IsString({ each: true, message: 'Each allergy must be a string' })
  allergies?: string[];
}
