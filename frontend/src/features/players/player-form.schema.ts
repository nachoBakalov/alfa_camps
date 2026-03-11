import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .or(z.literal(''));

export const playerFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().optional(),
  nickname: z.string().trim().optional(),
  avatarUrl: optionalUrl,
  isActive: z.boolean(),
});

export type PlayerFormValues = z.infer<typeof playerFormSchema>;
