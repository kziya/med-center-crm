import { Module } from '@nestjs/common';

import { ForgetPasswordProcessor } from './processors/forget-password.processor';
import { VerificationRequestProcessor } from './processors/verification-request.processor';
import { VerificationSuccessfulProcessor } from './processors/verification-successful.processor';

@Module({
  providers: [
    ForgetPasswordProcessor,
    VerificationRequestProcessor,
    VerificationSuccessfulProcessor,
  ],
})
export class AuthModule {}
