import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { CommonAuthGuard } from './common-auth.guard';
import { CommonAuthStrategy } from './common-auth.strategy';

@Module({
  providers: [
    CommonAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: CommonAuthGuard,
    },
  ],
  exports: [],
})
export class CommonAuthModule {}
