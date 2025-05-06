import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CommonAuthModule } from '@med-center-crm/auth';
import { CommonPatientModule } from '@med-center-crm/patient';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonUserModule } from '@med-center-crm/user';

@Module({
  imports: [
    CommonAuthModule,
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
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
