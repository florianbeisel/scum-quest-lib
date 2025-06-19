import { describe, it, expect } from 'vitest';
import { QuestBuilder } from '../src/builders';
import { QuestSchema } from '../src/schemas/quest';
import { FetchCondition } from '../src/types';
import fs from 'fs';
import path from 'path';

// Load example quests from the examples directory
const loadExampleQuest = (filename: string) => {
  const filePath = path.join(__dirname, '..', 'examples', 'Override', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

const loadBlockedQuests = () => {
  const filePath = path.join(
    __dirname,
    '..',
    'examples',
    'Blocked',
    'BlockedQuests.json'
  );
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

const loadQuestList = (filename: string) => {
  const filePath = path.join(
    __dirname,
    '..',
    'examples',
    'QuestList',
    filename
  );
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

describe('Real Quests from Game Developer', () => {
  it('should validate all example quests against our schema', () => {
    const exampleQuests = [
      'general-goods-quest.json',
      'Example_Elimination.json',
      'Example_Fetch.json',
      'Example_Interact.json',
    ];

    exampleQuests.forEach(questFile => {
      const quest = loadExampleQuest(questFile);
      const result = QuestSchema.safeParse(quest);

      if (!result.success) {
        console.log(`Validation failed for ${questFile}:`);
        result.error.issues.forEach((issue, i) => {
          console.log(
            `  ${i + 1}. Path: ${issue.path.join('.')} - ${issue.message}`
          );
        });
      }

      expect(result.success, `Quest ${questFile} should be valid`).toBe(true);
    });
  });

  it('should validate blocked quests configuration', () => {
    const blockedQuests = loadBlockedQuests();

    // Basic structure validation
    expect(blockedQuests).toHaveProperty('BlockAllDefaultQuests');
    expect(blockedQuests).toHaveProperty('BlockQuestNames');
    expect(Array.isArray(blockedQuests.BlockQuestNames)).toBe(true);
  });

  it('should validate quest list files', () => {
    const customQuestList = loadQuestList('CustomQuestList.json');
    const defaultQuestList = loadQuestList('DefaultQuestList.json');

    expect(Array.isArray(customQuestList)).toBe(true);
    expect(Array.isArray(defaultQuestList)).toBe(true);

    // Check that quest list entries are strings (quest paths)
    customQuestList.forEach((entry: string) => {
      expect(typeof entry).toBe('string');
    });
  });

  it('should rebuild the general goods quest using builder pattern', () => {
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
