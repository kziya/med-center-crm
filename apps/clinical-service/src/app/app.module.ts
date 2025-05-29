import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { BullMQConfig, TypeormConfig } from '@med-center-crm/common';
import { CommonAuthModule } from '@med-center-crm/auth';
import { AppointmentModule } from './appointment/appointment.module';
import { LabModule } from './lab/lab.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(TypeormConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync(BullMQConfig),
    CommonAuthModule,
    AppointmentModule,
    LabModule,
  ],
})
export class AppModule {}
