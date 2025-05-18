import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const MailerModuleConfig: MailerAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    transport: {
      url: configService.get('MAIL_TRANSPORTER_URL'),
    },
  }),
  inject: [ConfigService],
};
