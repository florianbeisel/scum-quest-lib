import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import {
  QuestCollection,
  parseQuestFromString,
  questToJson,
} from '../src/parsers';
import { QuestBuilder } from '../src/builders';

const testQuestsPath = join(process.cwd(), 'test-quests');

describe('Quest Parsers', () => {
  beforeEach(() => {
    if (existsSync(testQuestsPath)) {
      rmSync(testQuestsPath, { recursive: true });
    }
    mkdirSync(testQuestsPath, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testQuestsPath)) {
      rmSync(testQuestsPath, { recursive: true });
    }
  });

  it('should create and manage quest collection', () => {
    const collection = new QuestCollection({ basePath: testQuestsPath });

    // Add a quest using our builder
    const quest = new QuestBuilder()
      .withNPC('Bartender')
      .withTier(1)
      .withTitle('Test Quest')
      .withDescription('A test quest')
      .withTimeLimit(24)
      .addFetchCondition(c =>
        c
          .withSequenceIndex(0)
          .withCaption('Find 1 apple')
          .requireItems(['Apple'], 1)
      )
      .addCurrencyReward(100)
      .build();

    collection.addQuest('TestQuest', quest);
    collection.blockQuest('SomeDefaultQuest');

    // Export to files
    collection.exportToFiles();

    // Verify files were created
    expect(existsSync(join(testQuestsPath, 'Override', 'TestQuest.json'))).toBe(
      true
    );
    expect(
      existsSync(join(testQuestsPath, 'Blocked', 'BlockedQuests.json'))
    ).toBe(true);
    expect(
      existsSync(join(testQuestsPath, 'QuestList', 'CustomQuestList.json'))
    ).toBe(true);
  });

  it('should import and export quest collection', () => {
    const collection = new QuestCollection({ basePath: testQuestsPath });

    const quest = new QuestBuilder()
      .withNPC('Mechanic')
      .withTier(2)
      .withTitle('Import Test')
      .withDescription('Testing import functionality')
      .withTimeLimit(48)
      .addFetchCondition(c =>
        c
          .withSequenceIndex(0)
          .withCaption('Find 1 wrench')
          .requireItems(['Wrench'], 1)
      )
      .addCurrencyReward(200)
      .build();

    collection.addQuest('ImportTest', quest);
    collection.blockAllDefaultQuests(true);
    collection.exportToFiles();

    // Create new collection and import
    const newCollection = new QuestCollection({ basePath: testQuestsPath });
    newCollection.importFromFiles();

    expect(newCollection.getAllQuests().size).toBe(1);
    expect(newCollection.getQuest('ImportTest')?.Title).toBe('Import Test');
    expect(newCollection.getBlockedQuests().BlockAllDefaultQuests).toBe(true);
  });

  it('should parse quest from JSON string', () => {
    const questJson = questToJson(
      new QuestBuilder()
        .withNPC('Doctor')
        .withTier(1)
        .withTitle('Parse Test')
        .withDescription('Testing parsing')
        .withTimeLimit(12)
        .addFetchCondition(c =>
          c
            .withSequenceIndex(0)
            .withCaption('Find 1 bandage')
            .requireItems(['Bandage'], 1)
        )
        .addCurrencyReward(50)
        .build()
    );

    const parsedQuest = parseQuestFromString(questJson);
    expect(parsedQuest.Title).toBe('Parse Test');
    expect(parsedQuest.AssociatedNpc).toBe('Doctor');
  });
});
