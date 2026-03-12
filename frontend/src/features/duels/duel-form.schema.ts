import { z } from 'zod';

export const duelFormSchema = z
  .object({
    playerAParticipationId: z.string().trim().min(1, 'Player A is required'),
    playerBParticipationId: z.string().trim().min(1, 'Player B is required'),
    winnerParticipationId: z.string().trim().optional(),
  })
  .refine((values) => values.playerAParticipationId !== values.playerBParticipationId, {
    message: 'Player A and Player B must be different participations',
    path: ['playerBParticipationId'],
  })
  .refine(
    (values) => {
      if (!values.winnerParticipationId) {
        return true;
      }

      return (
        values.winnerParticipationId === values.playerAParticipationId ||
        values.winnerParticipationId === values.playerBParticipationId
      );
    },
    {
      message: 'Winner must be either Player A or Player B',
      path: ['winnerParticipationId'],
    },
  );

export type DuelFormValues = z.infer<typeof duelFormSchema>;
