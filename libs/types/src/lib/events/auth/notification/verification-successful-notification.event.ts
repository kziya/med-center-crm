import { BaseEvent } from '../../base.event';

export type VerificationSuccessfulNotificationEventData = {
  user_id: number;
};

export class VerificationSuccessfulNotificationEvent extends BaseEvent<VerificationSuccessfulNotificationEventData> {
  static override readonly queue = 'verification_successful_notification_queue';
  public readonly name = 'verification_successful_notification_event';
}
