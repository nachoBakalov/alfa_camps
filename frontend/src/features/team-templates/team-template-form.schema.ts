import { z } from 'zod';

const optionalColor = z
  .string()
  .trim()
  .regex(/^$|^#[0-9A-Fa-f]{6}$/, 'Use a hex color like #1E293B')
  .or(z.literal(''));

const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .or(z.literal(''));

export const teamTemplateFormSchema = z.object({
  campTypeId: z.string().trim().min(1, 'Camp type is required'),
  name: z.string().trim().min(1, 'Name is required'),
  color: optionalColor,
  logoUrl: optionalUrl,
  sortOrder: z
    .string()
    .trim()
    .regex(/^$|^\d+$/, 'Sort order must be a positive integer')
    .or(z.literal('')),
});

export type TeamTemplateFormValues = z.infer<typeof teamTemplateFormSchema>;
