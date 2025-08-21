import { z } from 'zod';
export const VerifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1),
});
