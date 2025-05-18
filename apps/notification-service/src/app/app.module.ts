import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import {
  BullMQConfig,
  RedisConfig,
  TypeormConfig,
} from '@med-center-crm/common';
import { RedisModule } from '@med-center-crm/redis';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(TypeormConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync(BullMQConfig),
    RedisModule.registerAsync(RedisConfig),
    NotificationModule,
    AuthModule,
  ],
})
export class AppModule {}
