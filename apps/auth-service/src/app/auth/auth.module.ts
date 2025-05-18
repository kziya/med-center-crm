import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CommonPatientModule } from '@med-center-crm/patient';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonUserModule } from '@med-center-crm/user';
import { BullModule } from '@nestjs/bullmq';
import { VerificationSuccessfulNotificationEvent } from '@med-center-crm/types';

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
    BullModule.registerQueue({
      name: VerificationSuccessfulNotificationEvent.queue,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
