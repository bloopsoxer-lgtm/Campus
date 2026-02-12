import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(2),
  currentChat: z.string().uppercase().optional().default('CAMPUS'),
  bio: z.string().optional()
});

export type User = z.infer<typeof UserSchema>;
