import { z } from 'zod';
import { optionalImagePathOrUrlSchema } from '../../lib/validation';

export const rankDefinitionFormSchema = z.object({
  categoryId: z.string().trim().min(1, 'Category is required'),
  name: z.string().trim().optional(),
  iconUrl: optionalImagePathOrUrlSchema,
  threshold: z
    .string()
    .trim()
    .min(1, 'Threshold is required')
    .regex(/^\d+$/, 'Threshold must be a non-negative integer'),
  rankOrder: z
    .string()
    .trim()
    .min(1, 'Rank order is required')
    .regex(/^-?\d+$/, 'Rank order must be an integer'),
});

export type RankDefinitionFormValues = z.infer<typeof rankDefinitionFormSchema>;
