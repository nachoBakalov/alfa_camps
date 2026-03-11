import { z } from 'zod';
import { optionalImagePathOrUrlSchema } from '../../lib/validation';

export const playerFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().optional(),
  nickname: z.string().trim().optional(),
  avatarUrl: optionalImagePathOrUrlSchema,
  isActive: z.boolean(),
});

export type PlayerFormValues = z.infer<typeof playerFormSchema>;
