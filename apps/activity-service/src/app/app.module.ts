import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonAuthModule } from '@med-center-crm/auth';
import { BullMQConfig, TypeormConfig } from '@med-center-crm/common';
import { ActivityModule } from './activity/activity.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(TypeormConfig),
    BullModule.forRootAsync(BullMQConfig),
    ActivityModule,
    CommonAuthModule,
  ],
})
export class AppModule {}
