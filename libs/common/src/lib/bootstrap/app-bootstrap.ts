import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { setupValidation } from './setup-validation';
import { setupSwagger } from './setup-swagger';

interface BootstrapOptions {
  port?: number;
  globalPrefix?: string;
  swagger?: {
    swaggerPath: string;
    appName: string;
    appDescription: string;
    appVersion: string;
  };
  validation?: boolean;
}

export async function bootstrapApp<T>(
  AppModule: T,
  options: BootstrapOptions = {}
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  const {
    swagger,
    port = parseInt(process?.env?.['PORT'] || '3000', 10),
    globalPrefix = 'api',
    validation,
  } = options;

  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  if (validation) {
    setupValidation(app);
  }

  if (swagger) {
    setupSwagger(app, swagger);
  }

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (swagger) {
    console.log(
      `📚 Swagger docs available at: http://localhost:${port}/${swagger.swaggerPath}`
    );
  }

  return app;
}
