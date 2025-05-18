import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Appointments, LabResults } from '@med-center-crm/types';
import { LabResultService } from './lab-result.service';
import { LabResultController } from './lab-result.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabResults, Appointments])],
  controllers: [LabResultController],
  providers: [LabResultService],
})
export class LabModule {}
