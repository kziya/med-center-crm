import { BaseEvent } from '../../base.event';

export type ResetPasswordSuccessfulEventData = {
  id_user: number;
};

export class ResetPasswordSuccessfulNotificationEvent extends BaseEvent<ResetPasswordSuccessfulEventData> {
  static override readonly queue =
    'reset_password_successful_notification_queue';

  public readonly name = 'reset_password_successful_notification_event';
}
