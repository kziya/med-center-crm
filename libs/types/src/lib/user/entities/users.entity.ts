import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole, UserStatus } from '../enums';
import { UserGender } from '../enums/user-gender.enum';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  full_name: string;

  @Column({ type: 'varchar', length: 20 })
  role: UserRole;

  @Column({ type: 'varchar', length: 20 })
  status: UserStatus;

  @Column({ type: 'varchar', length: 20 })
  gender: UserGender;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
