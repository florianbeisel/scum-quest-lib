import { z } from 'zod';
import { SkillSchema } from '../common/enums';

export const SkillRewardSchema = z.object({
  Skill: SkillSchema,
  Experience: z.number().int().positive(),
});

export const TradeDealSchema = z.object({
  Item: z.string().min(1),
  Price: z.number().int().positive().optional(),
  Amount: z.number().int().min(1).optional(),
  AllowExcluded: z.boolean().optional(),
  Fame: z.number().int().min(0).optional(),
});

export const ItemRewardSchema = z.object({
  Item: z.string().min(1),
  Amount: z.number().int().positive(),
});

export const RewardSchema = z
  .object({
    // Currency Group: 1 Slot
    CurrencyNormal: z.number().int().min(0).optional(),
    CurrencyGold: z.number().int().min(0).optional(),
    Fame: z.number().int().min(0).optional(),

    // Skills (each skill counts as 1 slot)
    Skills: z.array(SkillRewardSchema).optional(),

    // First counts as two slots - additional counts as one
    TradeDeals: z.array(TradeDealSchema).min(1).optional(),
  })
  .refine(
    reward => {
      let slots = 0;

      if (reward.CurrencyNormal || reward.CurrencyGold || reward.Fame)
        slots += 1;

      slots += reward.Skills?.length ?? 0;

      if (reward.TradeDeals?.length) {
        slots += 2;
        if (reward.TradeDeals.length > 1) {
          slots += reward.TradeDeals.length - 1;
        }
      }

      return slots <= 5;
    },
    {
      message:
        'Total slots for currency, skills, and trade deals must be less than or equal to 5',
    }
  );

export type Reward = z.infer<typeof RewardSchema>;
export type SkillReward = z.infer<typeof SkillRewardSchema>;
export type TradeDeal = z.infer<typeof TradeDealSchema>;
