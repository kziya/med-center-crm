import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  ActivityLogs,
  AppointmentDetails,
  Appointments,
  DoctorDetails,
  DoctorPatientAssignment,
  PatientDetails,
  LabResults,
  UserContacts,
  Users,
} from '@med-center-crm/types';

export const TypeormConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    driver: require('pg'),
    url: configService.get('POSTGRES_URL'),
    synchronize: false,
    type: 'postgres',
    entities: [
      ActivityLogs,
      Appointments,
      AppointmentDetails,
      DoctorDetails,
      DoctorPatientAssignment,
      PatientDetails,
      LabResults,
      Users,
      UserContacts,
    ],
    bigNumberStrings: false,
  }),
  inject: [ConfigService],
};
