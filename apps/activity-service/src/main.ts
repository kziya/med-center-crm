import { bootstrapApp } from '@med-center-crm/common';
import { AppModule } from './app/app.module';

bootstrapApp(AppModule, {
  swagger: {
    appName: 'ActivityService',
    appVersion: '1.0.0',
    appDescription: 'Activity service of the med-center-crm',
    swaggerPath: 'swagger',
  },
  validation: true,
});
