import { bootstrapApp } from '@med-center-crm/common';
import { AppModule } from './app/app.module';

bootstrapApp(AppModule, {
  swagger: {
    appName: 'AuthService',
    appVersion: '1.0.0',
    appDescription: 'Auth service of the med-center-crm',
    swaggerPath: '/swagger',
  },
});
