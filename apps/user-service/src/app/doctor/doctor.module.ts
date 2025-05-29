import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityLogEvent, DoctorDetails, Users } from '@med-center-crm/types';
import { CommonUserModule } from '@med-center-crm/user';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    CommonUserModule,
    TypeOrmModule.forFeature([Users, DoctorDetails]),
    BullModule.registerQueue({
      name: ActivityLogEvent.queue,
    }),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
