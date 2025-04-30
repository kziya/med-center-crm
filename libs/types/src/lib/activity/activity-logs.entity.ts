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
import { ActivityEntityType } from './activity-entity-type.enum';
import { ActivityActionType } from './activity-action-type.enum';

@Entity('activity_logs')
export class ActivityLogs {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  user_id!: number;

  @Column({ nullable: true })
  entity_id!: number;

  @Column({ type: 'enum', enum: ActivityEntityType })
  entity_type!: ActivityEntityType;

  @Column({ type: 'enum', enum: ActivityActionType })
  action_type!: ActivityActionType;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: Users;
}
