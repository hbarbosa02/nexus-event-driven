import { Either } from '@/shared/util/types/either';
import { EventEntity, EventStatus } from '@/database/feature/entities/event.entity';
import { PaginatedResult } from '@/shared/util/types/paginated-result';

export interface CreateEventRequest {
  name: string;
  data?: Record<string, any>;
}

export interface UpdateEventRequest {
  name?: string;
  data?: Record<string, any>;
  status?: EventStatus;
  error?: string;
  cancellationReason?: string;
}

export interface RetryEventRequest {
  maxRetries?: number;
}

export type CreateEventResponse = Either<Error, EventEntity>;
export type UpdateEventResponse = Either<Error, EventEntity>;
export type DeleteEventResponse = Either<Error, void>;
export type FindEventResponse = Either<Error, EventEntity>;
export type FindEventsResponse = Either<Error, PaginatedResult<EventEntity>>;
export type RetryEventResponse = Either<Error, EventEntity>;
