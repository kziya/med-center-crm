import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserTokenPayload } from '@med-center-crm/auth';
import { CommonPatientService } from '@med-center-crm/patient';
import { CreatePatientDto, Users } from '@med-center-crm/types';
import { CommonUserService } from '@med-center-crm/user';
import { AuthResult } from './auth.types';
import { EmailOrPasswordWrongException } from './exceptions/email-or-password-wrong.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly commonPatientService: CommonPatientService,
    private readonly commonUserService: CommonUserService
  ) {}

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.commonUserService.findByEmail(email);

    if (!user) {
      throw new EmailOrPasswordWrongException();
    }

    await this.verifyPassword(password, user.password_hash);

    return this.createAuthResult(user);
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

  async register(createPatientDto: CreatePatientDto): Promise<AuthResult> {
    const user = await this.commonPatientService.createPatient(
      createPatientDto
    );

    return this.createAuthResult(user);
  }

  private createAuthResult(user: Users): AuthResult {
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
