import { z } from 'zod';
import { pageQueryParamSchema } from '@/shared/feature/schemas/page-query-param.schema';

export const createExampleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  active: z.boolean().default(true),
});

export const updateExampleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().optional(),
});

export const exampleQuerySchema = pageQueryParamSchema.extend({
  name: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export type CreateExampleBodySchema = z.infer<typeof createExampleSchema>;
export type UpdateExampleBodySchema = z.infer<typeof updateExampleSchema>;
export type ExampleQuerySchema = z.infer<typeof exampleQuerySchema>;
