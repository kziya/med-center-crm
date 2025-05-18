import { ISendMailOptions } from '@nestjs-modules/mailer';

export interface INotificationStrategy {
  send(message: NotificationMessage): Promise<void>;
}

export enum NotificationType {
  Email = 'email',
}

export type NotificationMessage = EmailNotification;

export type EmailNotification = {
  type: NotificationType.Email;
  data: ISendMailOptions;
};
