import { ConfigModule, ConfigService } from '@nestjs/config';

import { RedisModuleAsyncOptions } from '@med-center-crm/redis';

export const RedisConfig: RedisModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    url: configService.get<string>('REDIS_URL') as string,
  }),
  inject: [ConfigService],
  global: true,
};
