import { z } from 'zod';
import { optionalImagePathOrUrlSchema } from '../../lib/validation';

const targetTypeSchema = z.enum(['camp', 'team', 'player']);

export const photoFormSchema = z.object({
  targetType: targetTypeSchema,
  campId: z.string().trim().optional(),
  teamId: z.string().trim().optional(),
  playerId: z.string().trim().optional(),
  imageUrl: optionalImagePathOrUrlSchema.refine((value) => Boolean(value.trim()), {
    message: 'Image URL is required',
  }),
});

export type PhotoFormValues = z.infer<typeof photoFormSchema>;
