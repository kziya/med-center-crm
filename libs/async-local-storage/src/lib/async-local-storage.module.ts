import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorageService } from './async-local-storage.service';

@Global()
@Module({
  providers: [AsyncLocalStorageService],
  exports: [AsyncLocalStorageService],
})
export class AsyncLocalStorageModule {}
