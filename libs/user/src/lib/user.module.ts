import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import {
  UserContacts,
  Users,
  VerificationSendNotificationEvent,
} from '@med-center-crm/types';
import { CommonUserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, UserContacts]),
    BullModule.registerQueue({
      name: VerificationSendNotificationEvent.queue,
    }),
  ],
  providers: [CommonUserService],
  exports: [CommonUserService],
})
export class CommonUserModule {}
