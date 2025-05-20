import { Processor, WorkerHost } from '@nestjs/bullmq';

import {
  ResetPasswordSendNotificationEvent,
  Users,
} from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';
import { Job } from 'bullmq';
import {
  NotificationMessage,
  NotificationType,
} from '../../notification/notification.types';
import { CommonUserService } from '@med-center-crm/user';

@Processor(ResetPasswordSendNotificationEvent.queue)
export class ResetPasswordSendProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly commonUserService: CommonUserService
  ) {
    super();
  }

  async process(job: Job<ResetPasswordSendNotificationEvent>): Promise<any> {
    const event = job.data;
    const user = await this.commonUserService.findById(event.data.user_id);

    if (!user) {
      return;
    }

    const notificationMessage = this.createNotificationMessage(event, user);

    await this.notificationService.sendNotification(notificationMessage);
  }

  private createNotificationMessage(
    event: ResetPasswordSendNotificationEvent,
    user: Users
  ): NotificationMessage {
    return {
      type: NotificationType.Email,
      data: {
        to: user.email,
        subject: 'Reset Password',
        html: `Reset password link <a href="#">${event.data.uid}</a>`,
      },
    };
  }
}
