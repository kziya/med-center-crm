import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Users } from '../user';

@Entity('patient_details')
export class PatientDetails {
  @PrimaryGeneratedColumn()
  patient_detail_id!: number;

  @Column()
  user_id!: number;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  insurance_provider?: string;

  @Column({ type: 'text', array: true, nullable: true })
  allergies?: string[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Users;
}
