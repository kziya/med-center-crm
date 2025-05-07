import { DynamicModule, Module } from '@nestjs/common';

import { CreateAsyncRedisModuleProviders } from './redis.providers';
import { RedisModuleAsyncOptions } from './redis.types';

@Module({})
export class RedisModule {
  static async registerAsync(
    options: RedisModuleAsyncOptions
  ): Promise<DynamicModule> {
    const providers = await CreateAsyncRedisModuleProviders(options);

    return {
      global: options.global || false,
      module: RedisModule,
      imports: options.imports || [],
      providers: providers,
      exports: providers,
    };
  }
}
