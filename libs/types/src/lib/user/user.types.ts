import { UserRole } from './user-role.enum';
import { Users } from './users.entity';
import { UserContacts } from './user-contacts.entity';

export type UserTokenPayload = {
  id: number;
  email: string;
  role: UserRole;
};

export type CreateUserDto = Pick<Users, 'email' | 'full_name' | 'role'> & {
  password: string;
  contact: Pick<UserContacts, 'phone' | 'address' | 'details'>;
};
