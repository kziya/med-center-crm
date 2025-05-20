import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import {
  Users,
  VerificationSendNotificationEvent,
} from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';
import { CommonUserService } from '@med-center-crm/user';
import {
  NotificationMessage,
  NotificationType,
} from '../../notification/notification.types';

@Processor(VerificationSendNotificationEvent.queue)
export class VerificationSendProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly commonUserService: CommonUserService
  ) {
    super();
  }

  async process(job: Job<VerificationSendNotificationEvent>): Promise<void> {
    const event = job.data;
    const user = await this.commonUserService.findById(event.data.user_id);

    if (!user) {
      return;
    }

    const notificationMessage = this.createNotificationMessage(event, user);

    await this.notificationService.sendNotification(notificationMessage);
  }

  private createNotificationMessage(
    event: VerificationSendNotificationEvent,
    user: Users
  ): NotificationMessage {
    return {
      type: NotificationType.Email,
      data: {
        to: user.email,
        subject: 'Verify Account',
        html: `You can verify your account via <a href="#">${event.data.uid}</a>`,
      },
    };
  }
}
