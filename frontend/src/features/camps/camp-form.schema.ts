import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .or(z.literal(''));

export const campFormSchema = z
  .object({
    campTypeId: z.string().trim().min(1, 'Camp type is required'),
    title: z.string().trim().min(1, 'Title is required'),
    year: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'Year must be a 4-digit number'),
    startDate: z.string().trim().min(1, 'Start date is required'),
    endDate: z.string().trim().min(1, 'End date is required'),
    location: z.string().trim().optional(),
    description: z.string().trim().optional(),
    logoUrl: optionalUrl,
    coverImageUrl: optionalUrl,
    status: z.enum(['DRAFT', 'ACTIVE', 'FINISHED']).optional(),
  })
  .refine(
    (values) => {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return true;
      }

      return start.getTime() <= end.getTime();
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    },
  );

export type CampFormValues = z.infer<typeof campFormSchema>;
