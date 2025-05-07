import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_MODULE_OPTIONS_KEY } from './redis.constants';
import { RedisModuleAsyncOptions, RedisModuleOptions } from './redis.types';

export const CreateAsyncRedisModuleProviders = async (
  moduleAsyncOptions: RedisModuleAsyncOptions
): Promise<Provider[]> => [
  {
    provide: REDIS_MODULE_OPTIONS_KEY,
    useFactory: moduleAsyncOptions.useFactory,
    inject: moduleAsyncOptions.inject,
  },
  {
    provide: Redis,
    useFactory: (options: RedisModuleOptions) => new Redis(options.url),
    inject: [REDIS_MODULE_OPTIONS_KEY],
  },
];
