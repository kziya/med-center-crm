import { bootstrapApp } from '@med-center-crm/common';
import { AppModule } from './app/app.module';

bootstrapApp(AppModule, {
  swagger: {
    appName: 'UserService',
    appVersion: '1.0.0',
    appDescription: 'User service of the med-center-crm',
    swaggerPath: 'swagger',
  },
  validation: true,
});
