import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { VerificationSuccessfulNotificationEvent } from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';

@Processor(VerificationSuccessfulNotificationEvent.queue)
export class VerificationSuccessfulProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(
    job: Job<VerificationSuccessfulNotificationEvent>
  ): Promise<void> {
    return null;
  }
}
