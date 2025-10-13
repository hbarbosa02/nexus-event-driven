import { z } from 'zod';
import { pageQueryParamSchema } from '@/shared/feature/schemas/page-query-param.schema';
import { EventStatus } from '@/database/feature/entities/event.entity';

export const createEventSchema = z.object({
  name: z.string().min(1).max(255),
  data: z.record(z.any()).optional(),
});

export const updateEventSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  data: z.record(z.any()).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  error: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const eventQuerySchema = pageQueryParamSchema.extend({
  status: z.nativeEnum(EventStatus).optional(),
  name: z.string().optional(),
  retryCount: z.coerce.number().int().min(0).optional(),
});

export const retryEventSchema = z.object({
  maxRetries: z.coerce.number().int().min(1).max(10).default(5),
});

export type CreateEventBodySchema = z.infer<typeof createEventSchema>;
export type UpdateEventBodySchema = z.infer<typeof updateEventSchema>;
export type EventQuerySchema = z.infer<typeof eventQuerySchema>;
export type RetryEventBodySchema = z.infer<typeof retryEventSchema>;
