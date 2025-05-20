import { Processor, WorkerHost } from '@nestjs/bullmq';

import { ResetPasswordSendNotificationEvent } from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';
import { Job } from 'bullmq';

@Processor(ResetPasswordSendNotificationEvent.queue)
export class ForgetPasswordProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  process(job: Job<ResetPasswordSendNotificationEvent>): Promise<any> {
    return null;
  }
}
