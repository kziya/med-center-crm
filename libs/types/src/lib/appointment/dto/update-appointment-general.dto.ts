import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentGeneralDto {
  @ApiPropertyOptional({
    description: 'Updated appointment date and time',
    example: '2025-06-01T15:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  appointment_time?: Date;

  @ApiPropertyOptional({
    description: 'Updated notes from the patient',
    example: 'Prefer a video call instead of in-person visit',
  })
  @IsOptional()
  @IsString({ message: 'patient_notes must be a string' })
  patient_notes?: string;
}
