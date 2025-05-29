import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AsyncLocalStorageModule } from '@med-center-crm/async-local-storage';
import { CommonRoleGuard } from './guards/common-role.guard';
import { CommonAuthGuard } from './guards';
import { CommonAuthStrategy } from './strategies';
import { SetAsyncContextInterceptor } from './interceptors/async-context.interceptor';

@Module({
  imports: [AsyncLocalStorageModule],
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
    {
      provide: APP_INTERCEPTOR,
      useClass: SetAsyncContextInterceptor,
    },
  ],
})
export class CommonAuthModule {}
