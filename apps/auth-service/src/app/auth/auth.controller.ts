import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { Public } from '@med-center-crm/auth';
import { CreatePatientDto } from '@med-center-crm/types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetPasswordDto } from './dto/send-reset-password.dto';
import { SendVerifyDto } from './dto/send-verify.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResultDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResultDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResultDto,
  })
  @ApiBody({ type: CreatePatientDto })
  async register(
    @Body() createPatientDto: CreatePatientDto
  ): Promise<AuthResultDto> {
    return this.authService.register(createPatientDto);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed',
    type: AuthResultDto,
  })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthResultDto> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Public()
  @Post('verify/send')
  @ApiOperation({ summary: 'Send verification email to the user' })
  @ApiBody({ type: SendVerifyDto })
  async sendVerify(@Body() sendVerify: SendVerifyDto): Promise<void> {
    return this.authService.sendVerifyNotification(sendVerify);
  }

  @Public()
  @Post('verify/:uid')
  @ApiOperation({ summary: 'Verify a user by UID' })
  @ApiParam({
    name: 'uid',
    description: 'User identifier from verification email or token',
    example: '12345-abcde',
  })
  async verify(@Param('uid') uid: string): Promise<void> {
    await this.authService.verifyUser(uid);
  }

  @Public()
  @Post('reset-password/send')
  @ApiOperation({ summary: 'Send password reset email to the user' })
  @ApiBody({ type: SendResetPasswordDto })
  async sendResetPassword(
    @Body() sendResetPasswordDto: SendResetPasswordDto
  ): Promise<void> {
    return this.authService.sendResetPasswordNotification(sendResetPasswordDto);
  }

  @Public()
  @Post('reset-password/:uid')
  @ApiOperation({ summary: 'Reset user password by UID' })
  @ApiParam({
    name: 'uid',
    description: 'User identifier from verification email or token',
    example: '12345-abcde',
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(
    @Param('uid') uid: string,
    @Body() updatePasswordDto: ResetPasswordDto
  ): Promise<void> {
    return this.authService.resetPassword(uid, updatePasswordDto);
  }
}
