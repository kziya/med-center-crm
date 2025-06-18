import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityLogEvent, ActivityLogs } from '@med-center-crm/types';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { BullModule } from '@nestjs/bullmq';
import { ActivityProcessor } from './activity.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLogs]),
    BullModule.registerQueue({
      name: ActivityLogEvent.queue,
    }),
  ],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityProcessor],
})
export class ActivityModule {}
