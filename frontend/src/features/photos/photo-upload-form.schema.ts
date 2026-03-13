import { z } from 'zod';

const targetTypeSchema = z.enum(['camp', 'team', 'player']);

export const photoUploadFormSchema = z
  .object({
    targetType: targetTypeSchema,
    campId: z.string().trim().optional(),
    teamId: z.string().trim().optional(),
    playerId: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.targetType === 'camp' && !value.campId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['campId'],
        message: 'Избери лагер.',
      });
    }

    if (value.targetType === 'team') {
      if (!value.campId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['campId'],
          message: 'Избери лагер за филтриране на отборите.',
        });
      }

      if (!value.teamId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['teamId'],
          message: 'Избери отбор.',
        });
      }
    }

    if (value.targetType === 'player' && !value.playerId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['playerId'],
        message: 'Избери играч.',
      });
    }
  });

export type PhotoUploadFormValues = z.infer<typeof photoUploadFormSchema>;
