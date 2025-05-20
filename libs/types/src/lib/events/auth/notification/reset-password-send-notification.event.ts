import { BaseEvent } from '../../base.event';

export type ResetPasswordSendNotificationEventData = {
  id_user: number;
  uid: string;
};

export class ResetPasswordSendNotificationEvent extends BaseEvent<ResetPasswordSendNotificationEventData> {
  static override readonly queue = 'reset_password_send_notification_queue';

  public readonly name = 'reset_password_send_notification_event';
}
