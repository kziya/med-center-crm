import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import {
  Users,
  VerificationSuccessfulNotificationEvent,
} from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';
import { CommonUserService } from '@med-center-crm/user';
import {
  NotificationMessage,
  NotificationType,
} from '../../notification/notification.types';

@Processor(VerificationSuccessfulNotificationEvent.queue)
export class VerificationSuccessfulProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly commonUserService: CommonUserService
  ) {
    super();
  }

  async process(
    job: Job<VerificationSuccessfulNotificationEvent>
  ): Promise<void> {
    const event = job.data;
    const user = await this.commonUserService.findById(event.data.user_id);

    if (!user) {
      return;
    }

    const notificationMessage = this.createNotificationMessage(user);

    await this.notificationService.sendNotification(notificationMessage);
  }

  private createNotificationMessage(user: Users): NotificationMessage {
    return {
      type: NotificationType.Email,
      data: {
        to: user.email,
        subject: 'Verify Account Successful',
        html: `${user.full_name} verify account successful !`,
      },
    };
  }
}
