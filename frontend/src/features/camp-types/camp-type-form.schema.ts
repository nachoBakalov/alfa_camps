import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .or(z.literal(''));

export const campTypeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
  description: z.string().trim().optional(),
  logoUrl: optionalUrl,
  coverImageUrl: optionalUrl,
});

export type CampTypeFormValues = z.infer<typeof campTypeFormSchema>;
