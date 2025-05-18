import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateLabResultDto {
  @ApiPropertyOptional({
    description: 'Type of test (e.g., Blood, MRI)',
    example: 'Blood',
  })
  @IsOptional()
  @IsString({ message: 'test_type must be a string' })
  test_type?: string;

  @ApiPropertyOptional({
    description: 'Specific test name',
    example: 'Hemoglobin',
  })
  @IsOptional()
  @IsString({ message: 'test_name must be a string' })
  test_name?: string;

  @ApiPropertyOptional({
    description: 'Test result value',
    example: '13.5 g/dL',
  })
  @IsOptional()
  @IsString({ message: 'result must be a string' })
  result?: string;

  @ApiPropertyOptional({
    description: 'Date when the test result was recorded',
    example: '2025-06-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  result_date?: string;

  @ApiPropertyOptional({
    description: 'Notes or interpretation of the result',
    example: 'Within normal range',
  })
  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes?: string;
}
