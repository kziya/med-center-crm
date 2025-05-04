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

@Entity('doctor_details')
export class DoctorDetails {
  @PrimaryGeneratedColumn()
  doctor_detail_id!: number;

  @Column()
  user_id!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialty?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  license_number?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  education?: string;

  @Column({ type: 'text', nullable: true })
  career_summary?: string;

  @Column({ type: 'jsonb', nullable: true })
  availability?: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Users;
}
