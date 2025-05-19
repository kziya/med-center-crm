import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { BullMQConfig, TypeormConfig } from '@med-center-crm/common';
import { CommonAuthModule } from '@med-center-crm/auth';
import { AdminModule } from './admin/admin.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(TypeormConfig),
    CommonAuthModule,
    AdminModule,
    DoctorModule,
    PatientModule,
    BullModule.forRootAsync(BullMQConfig),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
