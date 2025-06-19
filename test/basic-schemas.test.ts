import { describe, it, expect } from 'vitest';
import { QuestSchema } from '../src/schemas/';
import { BlockedQuestsSchema } from '../src/schemas/';

describe('Basic schemas', () => {
  it('should validate a quest', () => {
    const simpleQuest = {
      AssociatedNpc: 'Bartender',
      Tier: 1,
      Title: "Bartender's Quest",
      Description: "Bartender's Quest",
      RewardPool: [
        {
          CurrencyNormal: 100,
        },
      ],
      Conditions: [
        {
          Type: 'Fetch',
          SequenceIndex: 0,
          RequiredItems: [
            {
              AcceptedItems: ['Apple'],
              RequiredNum: 3,
            },
          ],
        },
      ],
    };
    const result = QuestSchema.safeParse(simpleQuest);

    if (!result.success) {
      console.log(result.error.issues);
    }

    expect(result.success).toBe(true);
  });

  it('should validate a blocked quest', () => {
    const blockedQuest = {
      BlockAllDefaultQuests: true,
      BlockQuestNames: ['T1_AR_Fetch_45ACPAmmobox'],
    };
    const result = BlockedQuestsSchema.safeParse(blockedQuest);

    if (!result.success) {
      console.log(result.error.issues);
    }

    expect(result.success).toBe(true);
  });

  it('should reject invalid quest tier', () => {
    const invalidQuest = {
      AssociatedNpc: 'Bartender',
      Tier: 10,
      Title: "Bartender's Quest",
      Description: "Bartender's Quest",
      RewardPool: [
        {
          CurrencyNormal: 100,
        },
      ],
      Conditions: [
        {
          Type: 'Fetch',
          SequenceIndex: 0,
          RequiredItems: [
            {
              AcceptedItems: ['Apple'],
              RequiredNum: 3,
            },
          ],
        },
      ],
    };
    const result = QuestSchema.safeParse(invalidQuest);

    if (!result.success) {
      console.log(result.error.issues);
    }

    expect(result.success).toBe(false);
  });
});
