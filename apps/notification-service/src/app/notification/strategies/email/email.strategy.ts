import { MailerService } from '@nestjs-modules/mailer';

import {
  INotificationStrategy,
  NotificationMessage,
} from '../../notification.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailStrategy implements INotificationStrategy {
  constructor(private readonly mailerService: MailerService) {}

  async send(notificationMessage: NotificationMessage): Promise<void> {
    return this.mailerService.sendMail(notificationMessage.data);
  }
}
