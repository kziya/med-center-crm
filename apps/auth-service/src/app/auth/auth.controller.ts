import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { Public } from '@med-center-crm/auth';
import { CreatePatientDto } from '@med-center-crm/types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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
}
