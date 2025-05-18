import { Processor, WorkerHost } from '@nestjs/bullmq';

import { ForgetPasswordNotificationEvent } from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';
import { Job } from 'bullmq';

@Processor(ForgetPasswordNotificationEvent.queue)
export class ForgetPasswordProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  process(job: Job<ForgetPasswordNotificationEvent>): Promise<any> {
    return null;
  }
}
