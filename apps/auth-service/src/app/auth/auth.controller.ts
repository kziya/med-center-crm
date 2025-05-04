import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(): Promise<void> {
    return;
  }

  @Post('register')
  async register(): Promise<void> {
    return;
  }
}
