import { z } from 'zod';
import { optionalImagePathOrUrlSchema } from '../../lib/validation';

const conditionTypeSchema = z.enum(['KILLS', 'SURVIVALS', 'DUEL_WINS', 'POINTS']);

export const achievementDefinitionFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  iconUrl: optionalImagePathOrUrlSchema,
  conditionType: conditionTypeSchema,
  threshold: z
    .string()
    .trim()
    .min(1, 'Threshold is required')
    .regex(/^\d+$/, 'Threshold must be a non-negative integer'),
});

export type AchievementDefinitionFormValues = z.infer<typeof achievementDefinitionFormSchema>;
