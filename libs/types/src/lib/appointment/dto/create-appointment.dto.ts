import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Doctor ID who will attend the appointment',
    example: 5,
  })
  @IsInt({ message: 'Doctor ID must be an integer' })
  doctor_id: number;

  @ApiProperty({
    description: 'Patient ID who scheduled the appointment',
    example: 12,
  })
  @IsInt({ message: 'Patient ID must be an integer' })
  patient_id: number;

  @ApiProperty({
    description: 'Scheduled time for the appointment',
    example: '2025-06-01T14:30:00Z',
  })
  @IsDateString(
    {},
    { message: 'Appointment time must be a valid ISO 8601 date-time string' }
  )
  appointment_time: string;

  @ApiProperty({
    description: 'Optional notes from the patient',
    example: 'Prefers afternoon appointments',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Patient notes must be a string' })
  patient_notes?: string;
}
