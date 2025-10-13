export interface Event {
  id: string;
  name: string;
  startTime: Date | null;
  endTime: Date | null;
  data: Record<string, any> | null;
  status: EventStatus;
  retryCount: number;
  error: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export enum EventStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
  CANCELLED = "cancelled",
}

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

export interface EventQueryParams {
  page?: number;
  limit?: number;
  status?: EventStatus;
  name?: string;
  retryCount?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
