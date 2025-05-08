import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '@med-center-crm/types';
import { CommonUserModule } from '@med-center-crm/user';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [CommonUserModule, TypeOrmModule.forFeature([Users])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
