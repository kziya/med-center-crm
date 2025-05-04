import { UserRole } from '@med-center-crm/types';

export type UserTokenPayload = {
  id: number;
  email: string;
  role: UserRole;
};
