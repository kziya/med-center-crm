import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

interface BootstrapOptions {
  port?: number;
  globalPrefix?: string;
  swagger?: {
    swaggerPath: string;
    appName: string;
    appDescription: string;
    appVersion: string;
  };
}

export async function bootstrapApp<T>(
  AppModule: T,
  options: BootstrapOptions = {}
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  const {
    swagger,
    port = parseInt(process?.env?.PORT || '3000', 10),
    globalPrefix = 'api',
  } = options;

  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  if (swagger) {
    const config = new DocumentBuilder()
      .setTitle(swagger.appName)
      .setDescription(swagger.appDescription)
      .setVersion(swagger.appVersion)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swagger.swaggerPath, app, document);
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
