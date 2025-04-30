import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Appointments } from './appointments.entity';

@Entity('appointment_details')
export class AppointmentDetails {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  appointment_id!: number;

  @Column({ type: 'timestamp' })
  visit_date!: Date;

  @Column({ type: 'text', nullable: true })
  diagnosis?: string;

  @Column({ type: 'text', nullable: true })
  treatment_plan?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToOne(() => Appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointments;
}
