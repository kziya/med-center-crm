import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Users } from '..';

@Entity('doctor_patient_assignments')
export class DoctorPatientAssignment {
  @PrimaryColumn()
  doctor_id!: number;

  @PrimaryColumn()
  patient_id!: number;

  @CreateDateColumn()
  assigned_at!: Date;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Users;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Users;
}
