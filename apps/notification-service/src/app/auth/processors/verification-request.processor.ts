import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { VerificationRequestNotificationEvent } from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';

@Processor(VerificationRequestNotificationEvent.queue)
export class VerificationRequestProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<VerificationRequestNotificationEvent>): Promise<void> {
    return null;
  }
}
