import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserTokenPayload } from '@med-center-crm/auth';
import { CommonPatientService } from '@med-center-crm/patient';
import {
  CreatePatientDto,
  Users,
  VerificationSuccessfulNotificationEvent,
  ResetPasswordSuccessfulNotificationEvent,
  ResetPasswordSendNotificationEvent,
  VerificationSendNotificationEvent,
} from '@med-center-crm/types';
import { CommonUserService } from '@med-center-crm/user';
import { EmailOrPasswordWrongException } from './exceptions/email-or-password-wrong.exception';
import { LoginDto } from './dto/login.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetPasswordDto } from './dto/send-reset-password.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly commonPatientService: CommonPatientService,
    private readonly commonUserService: CommonUserService,
    @InjectQueue(VerificationSuccessfulNotificationEvent.queue)
    private readonly verificationSuccessfulQueue: Queue<VerificationSuccessfulNotificationEvent>,
    @InjectQueue(VerificationSendNotificationEvent.queue)
    private readonly verificationSendNotificationQueue: Queue<VerificationSendNotificationEvent>,
    @InjectQueue(ResetPasswordSuccessfulNotificationEvent.queue)
    private readonly resetPasswordSuccessfulQueue: Queue<ResetPasswordSuccessfulNotificationEvent>,
    @InjectQueue(ResetPasswordSendNotificationEvent.queue)
    private readonly resetPasswordSendNotificationQueue: Queue<ResetPasswordSendNotificationEvent>,
    private readonly redis: Redis
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResultDto> {
    const user = await this.commonUserService.findByEmail(loginDto.email);

    if (!user) {
      throw new EmailOrPasswordWrongException();
    }

    await this.verifyPassword(loginDto.password, user.password_hash);

    return this.createAuthResult(user);
  }

  async register(createPatientDto: CreatePatientDto): Promise<AuthResultDto> {
    const user = await this.commonPatientService.createPatient(
      createPatientDto
    );

    return this.createAuthResult(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResultDto> {
    try {
      const userTokenPayload: UserTokenPayload = await this.jwtService.verify(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        }
      );

      const user = await this.commonUserService.findByEmail(
        userTokenPayload.email
      );

      if (!user) {
        throw new BadRequestException();
      }

      return this.createAuthResult(user);
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async verifyUser(uid: string): Promise<void> {
    const id = await this.redis.get(`VERIFY_USER:${uid}`);

    if (!id) {
      throw new BadRequestException();
    }

    await this.commonUserService.verifyUser(+id);

    const event = new VerificationSuccessfulNotificationEvent({
      user_id: +id,
    });

    await this.verificationSuccessfulQueue.add(event.name, event);
  }

  async sendVerifyNotification(
    userTokenPayload: UserTokenPayload
  ): Promise<void> {
    const user = await this.commonUserService.findById(userTokenPayload.id);

    if (!user) {
      throw new BadRequestException();
    }

    const uid = await this.setUID('VERIFY_USER', user.user_id, 360);
    const event = new VerificationSendNotificationEvent({
      uid,
      user_id: user.user_id,
    });

    await this.verificationSendNotificationQueue.add(event.name, event);
  }

  async resetPassword(
    uid: string,
    passwordUpdateDto: ResetPasswordDto
  ): Promise<void> {
    const id = await this.redis.get(`RESET_PASSWORD:${uid}`);

    if (!id) {
      throw new BadRequestException();
    }

    await this.commonUserService.updateUserGeneral(+id, {
      password: passwordUpdateDto.password,
    });

    const event = new ResetPasswordSuccessfulNotificationEvent({
      user_id: +id,
    });

    await this.resetPasswordSuccessfulQueue.add(event.name, event);
  }

  async sendResetPasswordNotification(
    sendResetPassword: SendResetPasswordDto
  ): Promise<void> {
    const user = await this.commonUserService.findByEmail(
      sendResetPassword.email
    );

    if (!user) {
      throw new BadRequestException();
    }

    const uid = await this.setUID('RESET_PASSWORD', user.user_id, 360);

    const event = new ResetPasswordSendNotificationEvent({
      user_id: user.user_id,
      uid,
    });
    await this.resetPasswordSendNotificationQueue.add(event.name, event);
  }

  private async setUID(
    type: string,
    id: number,
    expireInSec: number
  ): Promise<string> {
    const uid = uuidv4();

    await this.redis.set(`${type}:${uid}`, id, 'EX', expireInSec);

    return uid;
  }

  private async verifyPassword(
    password: string,
    passwordHash: string
  ): Promise<void> {
    const isCorrectPassword = await bcrypt.compare(password, passwordHash);

    if (!isCorrectPassword) {
      throw new EmailOrPasswordWrongException();
    }
  }

  private createAuthResult(user: Users): AuthResultDto {
    const payload: UserTokenPayload = {
      id: user.user_id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_TTL'),
      }),
    };
  }
}
