import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ActivityLogEvent } from '@med-center-crm/types';
import { Job } from 'bullmq';

@Processor(ActivityLogEvent.queue)
export class ActivityProcessor extends WorkerHost {
  async process(job: Job<ActivityLogEvent>): Promise<void> {
    return;
  }
}
