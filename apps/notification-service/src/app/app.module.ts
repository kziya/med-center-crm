import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  BullMQConfig,
  RedisConfig,
  TypeormConfig,
} from '@med-center-crm/common';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from '@med-center-crm/redis';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(TypeormConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync(BullMQConfig),
    RedisModule.registerAsync(RedisConfig),
  ],
})
export class AppModule {}
