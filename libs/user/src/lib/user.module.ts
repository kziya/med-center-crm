import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '@med-center-crm/types';
import { CommonUserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [CommonUserService],
  exports: [CommonUserService],
})
export class CommonUserModule {}
