import { describe, it, expect } from 'vitest';
import { QuestBuilder } from '../src/builders';
import { QuestSchema } from '../src/schemas/quest'; // Add this import
import { FetchCondition } from '../src/types';

describe('Real Quest from Game Developer', () => {
  it('should rebuild the official test quest using builder pattern', () => {
    const quest = new QuestBuilder()
      .withNPC('GeneralGoods')
      .withTier(1)
      .withTitle("General Goods trader's Special")
      .withDescription(
        'Collect apples for the General Goods trader and get a small reward.'
      )
      .withTimeLimit(24.0)
      .addFetchCondition(
        condition =>
          condition
            .withSequenceIndex(0)
            .withCaption('Gather apples')
            .autoComplete(false)
            .requireItems(['Apple_2'], 3)
            .keepItems(true)
        // TODO: Add support for MinAcceptedItemHealth and LocationsShownOnMap
      )
      .addReward(reward =>
        reward
          .currency(100, undefined, 5)
          .addSkill('Cooking', 20)
          .addTradeDeal('Pineapple', {
            Price: 50,
            Amount: 1,
            Fame: 0,
          })
      )
      .build();

    // Verify the built quest matches the original structure
    expect(quest.AssociatedNpc).toBe('GeneralGoods');
    expect(quest.Tier).toBe(1);
    expect(quest.Title).toBe("General Goods trader's Special");
    expect(quest.TimeLimitHours).toBe(24.0);

    // Check conditions
    expect(quest.Conditions).toHaveLength(1);
    const condition = quest.Conditions[0] as FetchCondition;
    expect(condition.Type).toBe('Fetch');
    expect(condition.SequenceIndex).toBe(0);
    expect(condition.TrackingCaption).toBe('Gather apples');
    expect(condition.CanBeAutoCompleted).toBe(false);
    expect(condition.PlayerKeepsItems).toBe(true);
    expect(condition.RequiredItems[0].AcceptedItems).toEqual(['Apple_2']);
    expect(condition.RequiredItems[0].RequiredNum).toBe(3);

    // Check rewards
    expect(quest.RewardPool).toHaveLength(1);
    const reward = quest.RewardPool[0];
    expect(reward.CurrencyNormal).toBe(100);
    expect(reward.Fame).toBe(5);
    expect(reward.Skills).toHaveLength(1);
    expect(reward.Skills![0].Skill).toBe('Cooking');
    expect(reward.Skills![0].Experience).toBe(20);
    expect(reward.TradeDeals).toHaveLength(1);
    expect(reward.TradeDeals![0].Item).toBe('Pineapple');
  });

  it('should validate the original JSON against our schema', () => {
    const originalQuest = {
      AssociatedNpc: 'GeneralGoods', // Fixed casing
      Tier: 1,
      Title: "General Goods trader's Special",
      Description:
        'Collect apples for the General Goods trader and get a small reward.',
      TimeLimitHours: 24.0,
      RewardPool: [
        {
          CurrencyNormal: 100,
          Fame: 5,
          Skills: [
            {
              Skill: 'Cooking',
              Experience: 20,
            },
          ],
          TradeDeals: [
            {
              Item: 'Pineapple',
              Price: 50,
              Amount: 1,
              Fame: 0,
            },
          ],
        },
      ],
      Conditions: [
        {
          TrackingCaption: 'Gather apples',
          SequenceIndex: 0,
          CanBeAutoCompleted: false,
          Type: 'Fetch',
          DisablePurchaseOfRequiredItems: false,
          PlayerKeepsItems: true,
          RequiredItems: [
            {
              AcceptedItems: ['Apple_2'],
              RequiredNum: 3,
              MinAcceptedItemHealth: 50.0,
            },
          ],
          LocationsShownOnMap: [
            {
              Location: {
                X: 1000.0,
                Y: 2000.0,
                Z: 50.0,
              },
              SizeFactor: 1.0,
            },
          ],
        },
      ],
    };

    const result = QuestSchema.safeParse(originalQuest);

    if (!result.success) {
      console.log('foo');
      console.log('Schema validation errors:');
      result.error.issues.forEach((issue, i) => {
        console.log(
          `  ${i + 1}. Path: ${issue.path.join('.')} - ${issue.message}`
        );
      });
    }

    expect(result.success).toBe(true);
  });
});
