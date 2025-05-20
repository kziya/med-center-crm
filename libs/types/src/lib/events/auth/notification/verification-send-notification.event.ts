import { BaseEvent } from '../../base.event';

export type VerificationNotificationEventData = {
  user_id: number;
};

export class VerificationSendNotificationEvent extends BaseEvent<VerificationNotificationEventData> {
  static override readonly queue = 'verification_request_notification_queue';
  public readonly name = 'verification_request_notification_event';
}
