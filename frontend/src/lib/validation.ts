import { z } from 'zod';

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isRootRelativeAssetPath(value: string): boolean {
  return value.startsWith('/assets/');
}

export const optionalImagePathOrUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      if (isRootRelativeAssetPath(value)) {
        return true;
      }

      if (isAbsoluteHttpUrl(value)) {
        return z.string().url().safeParse(value).success;
      }

      return false;
    },
    {
      message: 'Use an absolute URL (http/https) or a /assets/... path',
    },
  );
