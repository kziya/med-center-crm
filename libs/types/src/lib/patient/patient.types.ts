import { CreateUserDto, PatientDetails } from '../';

export type CreatePatientDto = CreateUserDto & {
  details: Pick<PatientDetails, 'dob' | 'insurance_provider' | 'allergies'>;
};
