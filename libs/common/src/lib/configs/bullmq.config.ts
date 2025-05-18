import { SharedBullAsyncConfiguration } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const BullMQConfig: SharedBullAsyncConfiguration = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    connection: {
      url: configService.get('REDIS_URL'),
      tls: {},
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  }),
  inject: [ConfigService],
};
