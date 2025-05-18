import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import {
  BullMQConfig,
  RedisConfig,
  TypeormConfig,
} from '@med-center-crm/common';
import { CommonAuthModule } from '@med-center-crm/auth';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from '@med-center-crm/redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(TypeormConfig),
    BullModule.forRootAsync(BullMQConfig),
    RedisModule.registerAsync(RedisConfig),
    CommonAuthModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
