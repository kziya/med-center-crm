import { BaseEvent } from '../../base.event';

export type ForgetPasswordNotificationEventData = {
  id_user: number;
};

export class ForgetPasswordNotificationEvent extends BaseEvent<ForgetPasswordNotificationEventData> {
  static override readonly queue = 'forget_password_notification_queue';

  public readonly name = 'forget_password_notification_event';
}
