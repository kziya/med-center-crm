import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BullMQConfig, TypeormConfig } from '@med-center-crm/common';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(TypeormConfig),
    BullModule.forRootAsync(BullMQConfig),
    ActivityModule,
  ],
})
export class AppModule {}
