import { z } from 'zod';

export const battleTypeOptions = ['MASS_BATTLE', 'DUEL_SESSION'] as const;
export const battleSessionOptions = ['MORNING', 'AFTERNOON', 'EVENING'] as const;
export const battleStatusOptions = ['DRAFT', 'COMPLETED', 'CANCELLED'] as const;

export const battleFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  battleType: z.enum(battleTypeOptions),
  battleDate: z.string().trim().min(1, 'Battle date is required'),
  session: z.union([z.enum(battleSessionOptions), z.literal('')]),
  winningTeamId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.union([z.enum(battleStatusOptions), z.literal('')]),
});

export type BattleFormValues = z.infer<typeof battleFormSchema>;
