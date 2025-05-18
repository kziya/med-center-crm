import { BaseEvent } from '../base.event';
import { ActivityLogs } from '../../activity';

export type ActivityLogEventData = Pick<
  ActivityLogs,
  | 'user_id'
  | 'entity_id'
  | 'entity_type'
  | 'action_type'
  | 'ip_address'
  | 'metadata'
>;
export class ActivityLogEvent extends BaseEvent<ActivityLogEventData> {
  static override readonly queue = 'activity_log_queue';

  public readonly name = 'activity_log_event';
}
