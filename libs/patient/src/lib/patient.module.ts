import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonUserModule } from '@med-center-crm/user';
import { CommonPatientService } from './patient.service';

@Module({
  imports: [CommonUserModule, TypeOrmModule.forFeature()],
  providers: [CommonPatientService],
  exports: [CommonPatientService],
})
export class CommonPatientModule {}
