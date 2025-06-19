import { z } from 'zod';

import { ConditionSchema } from '../conditions';
import { RewardSchema } from '../rewards';
import { NPCSchema } from '../common/enums';

export const QuestSchema = z.object({
  // Mandatory properties
  AssociatedNpc: NPCSchema,
  Tier: z.number().int().min(1).max(3),
  Title: z.string().min(1),
  Description: z.string().min(1),
  RewardPool: z.array(RewardSchema).min(1),
  Conditions: z.array(ConditionSchema).min(1),
  // Optional properties
  TimeLimitHours: z.number().positive().optional(),
});

export type Quest = z.infer<typeof QuestSchema>;
