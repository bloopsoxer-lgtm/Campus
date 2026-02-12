import { z } from 'zod';

export const RoomSchema = z.object({
  name: z.string().min(1),
  code: z.string().uppercase().length(6),
  description: z.string().optional()
});

export type Room = z.infer<typeof RoomSchema>;
