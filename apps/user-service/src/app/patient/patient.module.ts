import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityLogEvent, PatientDetails, Users } from '@med-center-crm/types';
import { CommonUserModule } from '@med-center-crm/user';
import { CommonPatientModule } from '@med-center-crm/patient';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    CommonUserModule,
    CommonPatientModule,
    TypeOrmModule.forFeature([Users, PatientDetails]),
    BullModule.registerQueue({
      name: ActivityLogEvent.queue,
    }),
  ],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
