import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AppointmentDetails,
  Appointments,
  DoctorPatientAssignment,
} from '@med-center-crm/types';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointments,
      AppointmentDetails,
      DoctorPatientAssignment,
    ]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
