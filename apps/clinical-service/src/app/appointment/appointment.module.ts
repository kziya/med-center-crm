import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ActivityLogEvent,
  AppointmentDetails,
  Appointments,
  DoctorPatientAssignment,
} from '@med-center-crm/types';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointments,
      AppointmentDetails,
      DoctorPatientAssignment,
    ]),
    BullModule.registerQueue({
      name: ActivityLogEvent.queue,
    }),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
