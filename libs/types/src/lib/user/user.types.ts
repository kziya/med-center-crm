import { UserRole } from './enums';

export type UserTokenPayload = {
  id: number;
  email: string;
  role: UserRole;
};
