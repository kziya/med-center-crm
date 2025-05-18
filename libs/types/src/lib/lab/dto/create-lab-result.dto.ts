import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateLabResultDto {
  @ApiProperty({ description: 'ID of the patient', example: 123 })
  @IsInt({ message: 'patient_id must be an integer' })
  @Min(1, { message: 'patient_id must be greater than 0' })
  patient_id: number;

  @ApiProperty({ description: 'ID of the doctor', example: 45 })
  @IsInt({ message: 'doctor_id must be an integer' })
  @Min(1, { message: 'doctor_id must be greater than 0' })
  doctor_id: number;

  @ApiPropertyOptional({
    description: 'Associated appointment ID',
    example: 78,
  })
  @IsOptional()
  @IsInt({ message: 'appointment_id must be an integer' })
  @Min(1, { message: 'appointment_id must be greater than 0' })
  appointment_id?: number;

  @ApiProperty({
    description: 'Type of test (e.g., Blood, MRI)',
    example: 'Blood',
  })
  @IsString({ message: 'test_type must be a string' })
  @IsNotEmpty({ message: 'test_type is required' })
  test_type: string;

  @ApiProperty({ description: 'Specific test name', example: 'Hemoglobin' })
  @IsString({ message: 'test_name must be a string' })
  @IsNotEmpty({ message: 'test_name is required' })
  test_name: string;

  @ApiPropertyOptional({
    description: 'Test result value',
    example: '13.5 g/dL',
  })
  @IsOptional()
  @IsString({ message: 'result must be a string' })
  result?: string;

  @ApiProperty({
    description: 'Date when the test result was recorded',
    example: '2025-06-01T10:00:00Z',
  })
  @IsDateString()
  result_date: string;

  @ApiProperty({
    description: 'Notes or interpretation of the result',
    example: 'Within normal range',
  })
  @IsString({ message: 'notes must be a string' })
  @IsNotEmpty({ message: 'notes are required' })
  notes: string;
}
