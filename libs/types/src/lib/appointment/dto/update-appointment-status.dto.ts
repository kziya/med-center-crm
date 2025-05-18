import { AppointmentStatus } from '../enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'New status of the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.COMPLETED,
  })
  @IsEnum(AppointmentStatus, {
    message: 'status must be a valid AppointmentStatus enum value',
  })
  status: AppointmentStatus;
}
