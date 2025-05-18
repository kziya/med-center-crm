import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BullMQConfig, TypeormConfig } from '@med-center-crm/common';
import { CommonAuthModule } from '@med-center-crm/auth';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(TypeormConfig),
    BullModule.forRootAsync(BullMQConfig),
    CommonAuthModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
