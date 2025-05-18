import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Appointments, Users } from '..';

@Entity('lab_results')
export class LabResults {
  @PrimaryGeneratedColumn()
  lab_result_id!: number;

  @Column()
  patient_id!: number;

  @Column({ nullable: true })
  doctor_id!: number;

  @Column({ nullable: true })
  appointment_id!: number;

  @Column({ type: 'varchar', length: 100 })
  test_type!: string;

  @Column({ type: 'varchar', length: 150 })
  test_name!: string;

  @Column({ type: 'text', nullable: true })
  result?: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  result_date!: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Users;

  @ManyToOne(() => Users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Users;

  @ManyToOne(() => Appointments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointments;
}
