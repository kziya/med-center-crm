import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import {
  ActivityLogEvent,
  UserContacts,
  Users,
  VerificationSendNotificationEvent,
} from '@med-center-crm/types';
import { AsyncLocalStorageModule } from '@med-center-crm/async-local-storage';
import { CommonUserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, UserContacts]),
    AsyncLocalStorageModule,
    BullModule.registerQueue(
      {
        name: VerificationSendNotificationEvent.queue,
      },
      {
        name: ActivityLogEvent.queue,
      }
    ),
  ],
  providers: [CommonUserService],
  exports: [CommonUserService],
})
export class CommonUserModule {}
