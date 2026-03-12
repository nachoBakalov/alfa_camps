import { z } from 'zod';
import { optionalImagePathOrUrlSchema } from '../../lib/validation';

const optionalColor = z
  .string()
  .trim()
  .regex(/^$|^#[0-9A-Fa-f]{6}$/, 'Use a hex color like #0F172A')
  .or(z.literal(''));

export const campTeamFormSchema = z.object({
  name: z.string().trim().min(1, 'Team name is required'),
  color: optionalColor,
  logoUrl: optionalImagePathOrUrlSchema,
  finalPosition: z
    .string()
    .trim()
    .regex(/^$|^\d+$/, 'Final position must be a positive integer')
    .or(z.literal('')),
  isActive: z.boolean(),
});

export type CampTeamFormValues = z.infer<typeof campTeamFormSchema>;
