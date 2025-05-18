import { BaseEvent } from '../../base.event';

export type VerificationNotificationEventData = {};

export class VerificationNotificationEvent extends BaseEvent<VerificationNotificationEventData> {
  static override readonly queue = 'verification_notification_queue';
  public readonly name = 'verification_notification_event';
}
