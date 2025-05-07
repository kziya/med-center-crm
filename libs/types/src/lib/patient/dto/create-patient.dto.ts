import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../user';

export class CreatePatientDetailsDto {
  @ApiProperty({
    description: 'Date of birth',
    example: '1990-01-01',
    type: String,
    format: 'date',
  })
  @Type(() => Date)
  @IsDate({ message: 'DOB must be a valid date' })
  dob: Date;

  @ApiPropertyOptional({
    description: 'Name of the insurance provider',
    example: 'Blue Cross Blue Shield',
  })
  @IsOptional()
  @IsString({ message: 'Insurance provider must be a string' })
  insurance_provider?: string;

  @ApiPropertyOptional({
    description: 'List of known allergies',
    example: ['Peanuts', 'Penicillin'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Allergies must be an array of strings' })
  @IsString({ each: true, message: 'Each allergy must be a string' })
  allergies?: string[];
}

export class CreatePatientDto extends CreateUserDto {
  @ApiProperty({ type: () => CreatePatientDetailsDto })
  @ValidateNested()
  @Type(() => CreatePatientDetailsDto)
  details: CreatePatientDetailsDto;
}
