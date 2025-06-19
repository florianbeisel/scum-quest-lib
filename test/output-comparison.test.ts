import { describe, it, expect } from 'vitest';
import { QuestBuilder } from '../src/builders';

describe('JSON Output Comparison', () => {
  it('should produce identical structure to the developer quest', () => {
    // Developer's original quest
    const developerQuest = {
      AssociatedNpc: 'GeneralGoods',
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

    // Quest built with our builder (currently incomplete)
    const builtQuest = new QuestBuilder()
      .withNPC('GeneralGoods')
      .withTier(1)
      .withTitle("General Goods trader's Special")
      .withDescription(
        'Collect apples for the General Goods trader and get a small reward.'
      )
      .withTimeLimit(24.0)
      .addFetchCondition(condition =>
        condition
          .withSequenceIndex(0)
          .withCaption('Gather apples')
          .autoComplete(false)
          .requireItemsWithHealth(['Apple_2'], 3, 50.0)
          .keepItems(true)
          .disablePurchase(false)
          .addMapLocation(1000.0, 2000.0, 50.0, 1.0)
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

    // Compare objects directly instead of JSON strings
    expect(builtQuest).toEqual(developerQuest);
  });
});
