import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { NotificationService } from './notification.service';
import { EmailStrategy } from './strategies/email/email.strategy';
import { MailerModuleConfig } from '../config/mailer-module.config';

@Global()
@Module({
  imports: [MailerModule.forRootAsync(MailerModuleConfig)],
  providers: [NotificationService, EmailStrategy],
  exports: [NotificationService],
})
export class NotificationModule {}
