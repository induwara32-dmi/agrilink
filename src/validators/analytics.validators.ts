import { z } from 'zod';

const empty = z.object({}).strict();
const query = z.object({ period: z.enum(['day', 'week', 'month', 'year', 'custom']).default('month'), from: z.coerce.date().optional(), to: z.coerce.date().optional() }).superRefine((value, context) => { if (value.period === 'custom' && (!value.from || !value.to)) context.addIssue({ code: 'custom', message: 'Custom periods require from and to dates.' }); if (value.from && value.to && value.from >= value.to) context.addIssue({ code: 'custom', message: 'The from date must be before the to date.' }); if (value.from && value.to && value.to.getTime() - value.from.getTime() > 5 * 366 * 86_400_000) context.addIssue({ code: 'custom', message: 'Analytics ranges cannot exceed five years.' }); });
export const analyticsSchema = z.object({ body: empty, params: empty, query });
