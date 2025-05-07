import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

interface SwaggerConfig {
  swaggerPath: string;
  appName: string;
  appDescription: string;
  appVersion: string;
}

export function setupSwagger(app: INestApplication, config: SwaggerConfig) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.appName)
    .setDescription(config.appDescription)
    .setVersion(config.appVersion)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(config.swaggerPath, app, document);
}
