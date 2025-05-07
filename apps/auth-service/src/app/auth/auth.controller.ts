import { Body, Controller, Post } from '@nestjs/common';

import { Public } from '@med-center-crm/auth';
import { CreatePatientDto } from '@med-center-crm/types';
import { AuthService } from './auth.service';
import { AuthResult } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string
  ): Promise<AuthResult> {
    return this.authService.login(email, password);
  }

  @Public()
  @Post('register')
  async register(createPatientDto: CreatePatientDto): Promise<AuthResult> {
    return this.authService.register(createPatientDto);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string
  ): Promise<AuthResult> {
    return this.authService.refreshToken(refreshToken);
  }
}
