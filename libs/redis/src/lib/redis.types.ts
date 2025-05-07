import { DynamicModule, ForwardReference, Type } from '@nestjs/common';

export type RedisModuleOptions = {
  url: string;
};

export type RedisModuleAsyncOptions = {
  imports?: (
    | Promise<DynamicModule>
    | ForwardReference<any>
    | DynamicModule
    | Type<any>
  )[];
  useFactory: (
    ...args: any[]
  ) => RedisModuleOptions | Promise<RedisModuleOptions>;
  inject?: any[];
  global?: boolean;
};
