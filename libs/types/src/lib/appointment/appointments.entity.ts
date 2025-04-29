import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Users } from '../user';
import { AppointmentStatus } from './appointment-status.enum';

@Entity('appointments')
export class Appointments {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  doctor_id!: number;

  @Column()
  patient_id!: number;

  @Column({ type: 'timestamp' })
  appointment_time!: Date;

  @Column({ type: 'varchar', length: 20 })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  doctor_notes?: string;

  @Column({ type: 'text', nullable: true })
  patient_notes?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Users;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Users;
}
