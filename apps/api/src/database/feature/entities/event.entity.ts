import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum EventStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class EventEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string | null;
}
