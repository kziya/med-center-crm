import { Body, Controller, Post } from '@nestjs/common';

import { CreatePatientDto } from '@med-center-crm/types';
import { AuthService } from './auth.service';
import { AuthResult } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string
  ): Promise<AuthResult> {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(createPatientDto: CreatePatientDto): Promise<AuthResult> {
    return this.authService.register(createPatientDto);
  }
}
