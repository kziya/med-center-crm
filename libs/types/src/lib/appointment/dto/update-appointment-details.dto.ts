import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDetailsDto {
  @ApiPropertyOptional({
    description: 'Diagnosis provided by the doctor',
    example: 'Acute sinusitis',
  })
  @IsOptional()
  @IsString({ message: 'diagnosis must be a string' })
  diagnosis?: string;

  @ApiPropertyOptional({
    description: 'Recommended treatment plan',
    example: 'Prescribed antibiotics and nasal irrigation',
  })
  @IsOptional()
  @IsString({ message: 'treatment_plan must be a string' })
  treatment_plan?: string;

  @ApiPropertyOptional({
    description: 'Additional notes from the doctor',
    example: 'Patient should return in 7 days for follow-up',
  })
  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes?: string;
}
