import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { CommonRoleGuard } from './guards/common-role.guard';
import { CommonAuthGuard } from './guards';
import { CommonAuthStrategy } from './strategies';

@Module({
  providers: [
    CommonAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: CommonAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CommonRoleGuard,
    },
  ],
})
export class CommonAuthModule {}
