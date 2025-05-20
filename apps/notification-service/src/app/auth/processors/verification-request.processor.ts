import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { VerificationSendNotificationEvent } from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';

@Processor(VerificationSendNotificationEvent.queue)
export class VerificationRequestProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<VerificationSendNotificationEvent>): Promise<void> {
    return null;
  }
}
