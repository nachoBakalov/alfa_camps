import { z } from 'zod';
import { optionalImagePathOrUrlSchema } from '../../lib/validation';

const medalTypeSchema = z.enum(['MANUAL', 'AUTO']);

export const medalDefinitionFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  iconUrl: optionalImagePathOrUrlSchema,
  type: medalTypeSchema,
});

export type MedalDefinitionFormValues = z.infer<typeof medalDefinitionFormSchema>;
