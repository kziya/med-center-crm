import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorDetails, Users } from '@med-center-crm/types';
import { CommonUserModule } from '@med-center-crm/user';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';

@Module({
  imports: [CommonUserModule, TypeOrmModule.forFeature([Users, DoctorDetails])],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
