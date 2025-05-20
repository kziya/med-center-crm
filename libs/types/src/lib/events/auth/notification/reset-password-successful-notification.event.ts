import { BaseEvent } from '../../base.event';

export type ResetPasswordSuccessfulEventData = {
  user_id: number;
};

export class ResetPasswordSuccessfulNotificationEvent extends BaseEvent<ResetPasswordSuccessfulEventData> {
  static override readonly queue =
    'reset_password_successful_notification_queue';

  public readonly name = 'reset_password_successful_notification_event';
}
