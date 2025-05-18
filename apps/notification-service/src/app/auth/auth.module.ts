import { Module } from '@nestjs/common';

import { ForgetPasswordProcessor } from './processors/forget-password.processor';
import { VerificationProcessor } from './processors/verification.processor';

@Module({
  providers: [ForgetPasswordProcessor, VerificationProcessor],
})
export class AuthModule {}
