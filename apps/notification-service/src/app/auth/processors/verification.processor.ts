import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { VerificationNotificationEvent } from '@med-center-crm/types';
import { NotificationService } from '../../notification/notification.service';

@Processor(VerificationNotificationEvent.queue)
export class VerificationProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<VerificationNotificationEvent>): Promise<void> {
    return null;
  }
}
