import { Module } from '@nestjs/common';

import { CommonUserService } from './user.service';

@Module({
  providers: [CommonUserService],
  exports: [CommonUserService],
})
export class CommonUserModule {}
