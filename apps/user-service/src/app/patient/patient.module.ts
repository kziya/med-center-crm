import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '@med-center-crm/types';
import { CommonUserModule } from '@med-center-crm/user';
import { CommonPatientModule } from '@med-center-crm/patient';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

@Module({
  imports: [
    CommonUserModule,
    CommonPatientModule,
    TypeOrmModule.forFeature([Users]),
  ],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
