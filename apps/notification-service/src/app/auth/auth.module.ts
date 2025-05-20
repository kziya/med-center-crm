import { Module } from '@nestjs/common';

import { CommonUserModule } from '@med-center-crm/user';
import { ResetPasswordSendProcessor } from './processors/reset-password-send.processor';
import { VerificationSendProcessor } from './processors/verification-send.processor';
import { VerificationSuccessfulProcessor } from './processors/verification-successful.processor';
import { ResetPasswordSuccessfulProcessor } from './processors/reset-password-successful.processor';

@Module({
  imports: [CommonUserModule],
  providers: [
    ResetPasswordSendProcessor,
    ResetPasswordSuccessfulProcessor,
    VerificationSendProcessor,
    VerificationSuccessfulProcessor,
  ],
})
export class AuthModule {}
