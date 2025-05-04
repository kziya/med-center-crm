import { Module } from '@nestjs/common';

import { CommonAuthModule } from '@med-center-crm/auth';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [CommonAuthModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
