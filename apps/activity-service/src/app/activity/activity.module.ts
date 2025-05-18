import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityLogs } from '@med-center-crm/types';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLogs])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
