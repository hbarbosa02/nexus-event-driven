import { BaseRepository } from '@/shared/data-access/repositories/base.repository';
import { EventEntity, EventStatus } from '@/database/feature/entities/event.entity';

export abstract class EventRepository extends BaseRepository<EventEntity> {
  abstract findByStatus(status: EventStatus): Promise<EventEntity[]>;
  abstract findPendingEvents(): Promise<EventEntity[]>;
  abstract findFailedEvents(): Promise<EventEntity[]>;
  abstract findByRetryCount(maxRetryCount: number): Promise<EventEntity[]>;
}
