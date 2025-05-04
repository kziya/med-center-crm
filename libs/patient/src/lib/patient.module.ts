import { Module } from '@nestjs/common';

import { CommonPatientService } from './patient.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature()],
  providers: [CommonPatientService],
  exports: [CommonPatientService],
})
export class CommonPatientModule {}
