import { Injectable } from '@nestjs/common';
import { NotificationMessage, NotificationType } from './notification.types';
import { EmailStrategy } from './strategies/email/email.strategy';

@Injectable()
export class NotificationService {
  constructor(private readonly emailStrategy: EmailStrategy) {}

  async sendNotification(
    notificationMessage: NotificationMessage
  ): Promise<void> {
    switch (notificationMessage.type) {
      case NotificationType.Email:
        return this.emailStrategy.send(notificationMessage);
      default:
        return;
    }
  }
}
