import { Module } from '@nestjs/common';

import { CommonAuthModule } from '@med-center-crm/auth';

@Module({
  imports: [CommonAuthModule],
})
export class AuthModule {}
