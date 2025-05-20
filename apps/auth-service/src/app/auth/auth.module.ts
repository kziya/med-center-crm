import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { CommonUserModule } from '@med-center-crm/user';
import {
  ResetPasswordSendNotificationEvent,
  ResetPasswordSuccessfulNotificationEvent,
  VerificationSendNotificationEvent,
  VerificationSuccessfulNotificationEvent,
} from '@med-center-crm/types';
import { CommonPatientModule } from '@med-center-crm/patient';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    CommonUserModule,
    CommonPatientModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_TTL'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: VerificationSuccessfulNotificationEvent.queue,
      },
      {
        name: VerificationSendNotificationEvent.queue,
      },
      {
        name: ResetPasswordSendNotificationEvent.queue,
      },
      {
        name: ResetPasswordSuccessfulNotificationEvent.queue,
      }
    ),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
