import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { CommonUserService } from '@med-center-crm/user';
import {
  ResetPasswordSuccessfulNotificationEvent,
  Users,
} from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';
import {
  NotificationMessage,
  NotificationType,
} from '../../notification/notification.types';

@Processor(ResetPasswordSuccessfulNotificationEvent.queue)
export class ResetPasswordSuccessfulProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly commonUserService: CommonUserService
  ) {
    super();
  }

  async process(
    job: Job<ResetPasswordSuccessfulNotificationEvent>
  ): Promise<any> {
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
        subject: 'Reset Password Successful',
        html: `${user.full_name} reset password successful !`,
      },
    };
  }
}
