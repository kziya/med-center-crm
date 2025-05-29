import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ActivityLogEvent,
  Appointments,
  LabResults,
} from '@med-center-crm/types';
import { LabResultService } from './lab-result.service';
import { LabResultController } from './lab-result.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([LabResults, Appointments]),
    BullModule.registerQueue({
      name: ActivityLogEvent.queue,
    }),
  ],
  controllers: [LabResultController],
  providers: [LabResultService],
})
export class LabModule {}
