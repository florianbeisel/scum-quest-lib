import { describe, it, expect } from 'vitest';
import { QuestSchema } from '../src/schemas/quest';

describe('Quest Schema Normalization', () => {
  it('should normalize AssociatedNPC to AssociatedNpc', () => {
    const questWithUppercase = {
      AssociatedNPC: 'GeneralGoods',
      Tier: 1,
      Title: 'Test Quest',
      Description: 'A test quest',
      TimeLimitHours: 24,
      RewardPool: [{ CurrencyNormal: 100 }],
      Conditions: [
        {
          Type: 'Fetch',
          TrackingCaption: 'Find 1 item',
          SequenceIndex: 0,
          RequiredItems: [{ AcceptedItems: ['Item'], RequiredNum: 1 }],
        },
      ],
    };

    const result = QuestSchema.safeParse(questWithUppercase);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.AssociatedNpc).toBe('GeneralGoods');
      expect(result.data.AssociatedNPC).toBeUndefined();
    }
  });

  it('should prefer AssociatedNpc when both are present', () => {
    const questWithBoth = {
      AssociatedNpc: 'Armorer',
      AssociatedNPC: 'GeneralGoods',
      Tier: 1,
      Title: 'Test Quest',
      Description: 'A test quest',
      TimeLimitHours: 24,
      RewardPool: [{ CurrencyNormal: 100 }],
      Conditions: [
        {
          Type: 'Fetch',
          TrackingCaption: 'Find 1 item',
          SequenceIndex: 0,
          RequiredItems: [{ AcceptedItems: ['Item'], RequiredNum: 1 }],
        },
      ],
    };

    const result = QuestSchema.safeParse(questWithBoth);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.AssociatedNpc).toBe('Armorer'); // Should prefer the camelCase version
      expect(result.data.AssociatedNPC).toBeUndefined();
    }
  });

  it('should work with existing camelCase format', () => {
    const questWithCamelCase = {
      AssociatedNpc: 'Banker',
      Tier: 1,
      Title: 'Test Quest',
      Description: 'A test quest',
      TimeLimitHours: 24,
      RewardPool: [{ CurrencyNormal: 100 }],
      Conditions: [
        {
          Type: 'Fetch',
          TrackingCaption: 'Find 1 item',
          SequenceIndex: 0,
          RequiredItems: [{ AcceptedItems: ['Item'], RequiredNum: 1 }],
        },
      ],
    };

    const result = QuestSchema.safeParse(questWithCamelCase);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.AssociatedNpc).toBe('Banker');
      expect(result.data.AssociatedNPC).toBeUndefined();
    }
  });
});
