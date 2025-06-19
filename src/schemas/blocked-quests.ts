import { z } from 'zod';

export const BlockedQuestsSchema = z.object({
  BlockAllDefaultQuests: z.boolean().default(false),
  BlockQuestNames: z.array(z.string()).default([]),
});

export type BlockedQuests = z.infer<typeof BlockedQuestsSchema>;
