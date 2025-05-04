import { Controller, Post } from '@nestjs/common';

import { CreatePatientDto } from '@med-center-crm/types';
import { AuthService } from './auth.service';
import { AuthResult } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(): Promise<void> {
    return;
  }

  @Post('register')
  async register(createPatientDto: CreatePatientDto): Promise<AuthResult> {
    return;
  }
}
