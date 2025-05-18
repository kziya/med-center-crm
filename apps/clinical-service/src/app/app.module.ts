import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { TypeormConfig } from '@med-center-crm/common';
import { CommonAuthModule } from '@med-center-crm/auth';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(TypeormConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    CommonAuthModule,
    AppointmentModule,
  ],
})
export class AppModule {}
