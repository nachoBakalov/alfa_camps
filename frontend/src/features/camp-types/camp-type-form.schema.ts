import { z } from 'zod';
import { optionalImagePathOrUrlSchema } from '../../lib/validation';

export const campTypeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
  description: z.string().trim().optional(),
  logoUrl: optionalImagePathOrUrlSchema,
  coverImageUrl: optionalImagePathOrUrlSchema,
});

export type CampTypeFormValues = z.infer<typeof campTypeFormSchema>;
