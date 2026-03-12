import { z } from 'zod';

export const rankCategoryFormSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  name: z.string().trim().min(1, 'Name is required'),
});

export type RankCategoryFormValues = z.infer<typeof rankCategoryFormSchema>;
