import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { ActivityLogEvent } from '@med-center-crm/types';
import { ActivityService } from './activity.service';

@Processor(ActivityLogEvent.queue)
export class ActivityProcessor extends WorkerHost {
  constructor(private readonly activityService: ActivityService) {
    super();
  }

  async process(job: Job<ActivityLogEvent>): Promise<void> {
    await this.activityService.createActivityLog(job.data);
  }
}
