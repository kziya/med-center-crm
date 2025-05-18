import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import {
  Users,
  VerificationRequestNotificationEvent,
} from '@med-center-crm/types';
import { CommonUserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    BullModule.registerQueue({
      name: VerificationRequestNotificationEvent.queue,
    }),
  ],
  providers: [CommonUserService],
  exports: [CommonUserService],
})
export class CommonUserModule {}
