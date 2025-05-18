import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../enum';

class AppointmentDetailsDto {
  @ApiProperty({
    example: 'Migraine',
    required: false,
    description: 'Diagnosis made by the doctor',
  })
  diagnosis?: string;

  @ApiProperty({
    example: 'Prescribed ibuprofen and rest',
    required: false,
    description: 'Recommended treatment plan',
  })
  treatment_plan?: string;

  @ApiProperty({
    example: 'Patient to return in 2 weeks',
    required: false,
    description: 'Additional notes from the doctor',
  })
  notes?: string;

  @ApiProperty({
    example: '2025-05-20T10:00:00Z',
    description: 'Creation time of appointment details',
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-05-20T10:15:00Z',
    description: 'Last update time of appointment details',
  })
  updated_at: Date;
}

export class FullAppointmentDto {
  @ApiProperty({ example: 101, description: 'Unique appointment identifier' })
  appointment_id: number;

  @ApiProperty({ example: 5, description: 'Doctor ID' })
  doctor_id: number;

  @ApiProperty({ example: 12, description: 'Patient ID' })
  patient_id: number;

  @ApiProperty({
    example: '2025-06-01T14:30:00Z',
    description: 'Scheduled appointment time',
  })
  appointment_time: Date;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
    description: 'Current status of the appointment',
  })
  status: AppointmentStatus;

  @ApiProperty({
    example: 'Experiencing headaches and nausea.',
    required: false,
    description: 'Patient-provided notes',
  })
  patient_notes?: string;

  @ApiProperty({
    example: '2025-05-20T10:00:00Z',
    description: 'Creation timestamp of the appointment',
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-05-20T10:15:00Z',
    description: 'Last update timestamp of the appointment',
  })
  updated_at: Date;

  @ApiProperty({
    type: () => AppointmentDetailsDto,
    description: 'Detailed medical information for the appointment',
  })
  details: AppointmentDetailsDto;
}
