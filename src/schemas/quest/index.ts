import { z } from 'zod';

import { ConditionSchema } from '../conditions';
import { RewardSchema } from '../rewards';
// import { NPCSchema } from '../common/enums'; // No longer needed

// Quest tier type for external use
export const QuestTierSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
export type QuestTier = z.infer<typeof QuestTierSchema>;

export const QuestSchema = z
  .object({
    // Accept both casings for compatibility, normalize to AssociatedNpc
    AssociatedNpc: z.string().min(1).optional(),
    AssociatedNPC: z.string().min(1).optional(),
    Tier: QuestTierSchema,
    Title: z.string().min(1),
    Description: z.string().min(1),
    RewardPool: z.array(RewardSchema).min(1),
    Conditions: z.array(ConditionSchema).min(1),
    // Required properties
    TimeLimitHours: z.number().positive(),
  })
  .refine(data => !!(data.AssociatedNpc || data.AssociatedNPC), {
    message: 'Either AssociatedNpc or AssociatedNPC is required',
  })
  .transform(data => {
    // Normalize to AssociatedNpc, preferring it if both are present
    const normalizedNpc = data.AssociatedNpc || data.AssociatedNPC;
    return {
      ...data,
      AssociatedNpc: normalizedNpc,
      AssociatedNPC: undefined, // Remove the uppercase variant
    };
  });

export type Quest = z.infer<typeof QuestSchema>;
