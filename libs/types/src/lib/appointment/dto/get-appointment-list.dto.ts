import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { AppointmentStatus } from '../enum';

export class GetAppointmentListDto {
  @ApiPropertyOptional({
    description: 'Filter by doctor ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'doctor_id must be an integer' })
  doctor_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by patient ID',
    example: 12,
  })
  @IsOptional()
  @IsInt({ message: 'patient_id must be an integer' })
  patient_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus, {
    message: 'status must be a valid AppointmentStatus value',
  })
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'ID of the last appointment received (for pagination)',
    example: 105,
  })
  @IsOptional()
  @IsInt({ message: 'last_appointment_id must be an integer' })
  last_appointment_id?: number;

  @ApiPropertyOptional({
    description: 'Number of records to return (pagination limit)',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must be less than 100' })
  limit?: number;
}
