import { z } from 'zod';

export const emptyRequestSchema = z.object({
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

export const uuidParameterSchema = z.object({
  body: z.unknown(),
  params: z.object({ id: z.string().uuid() }),
  query: z.unknown(),
});
