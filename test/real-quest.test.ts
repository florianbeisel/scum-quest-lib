import { describe, it, expect } from 'vitest';
import { QuestBuilder } from '../src/builders';
import { QuestSchema } from '../src/schemas/quest'; // Add this import
import { FetchCondition } from '../src/types';
import fs from 'fs';
import path from 'path';

// Load the example quest from the examples directory
const loadExampleQuest = (filename: string) => {
  const filePath = path.join(__dirname, '..', 'examples', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

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
    const originalQuest = loadExampleQuest('general-goods-quest.json');

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
