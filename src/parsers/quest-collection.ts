import {
  readdirSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
} from 'fs';
import { join } from 'path';
import type { Quest, BlockedQuests } from '../types/index.js';
import { QuestSchema } from '../schemas/quest/index.js';
import { BlockedQuestsSchema } from '../schemas/blocked-quests.js';

export interface QuestCollectionOptions {
  basePath: string; // Path to the Quests folder
  validateOnImport?: boolean;
}

export class QuestCollection {
  private quests: Map<string, Quest> = new Map();
  private blockedQuests: BlockedQuests = {
    BlockAllDefaultQuests: false,
    BlockQuestNames: [],
  };
  private basePath: string;
  private validateOnImport: boolean;

  constructor(options: QuestCollectionOptions) {
    this.basePath = options.basePath;
    this.validateOnImport = options.validateOnImport ?? true;
  }

  // Quest management
  addQuest(name: string, quest: Quest): void {
    if (this.validateOnImport) {
      const result = QuestSchema.safeParse(quest);
      if (!result.success) {
        throw new Error(
          `Invalid quest "${name}": ${result.error.issues
            .map(i => i.message)
            .join(', ')}`
        );
      }
    }
    this.quests.set(name, quest);
  }

  removeQuest(name: string): boolean {
    return this.quests.delete(name);
  }

  getQuest(name: string): Quest | undefined {
    return this.quests.get(name);
  }

  getAllQuests(): Map<string, Quest> {
    return new Map(this.quests);
  }

  // Blocked quests management
  setBlockedQuests(blocked: BlockedQuests): void {
    const result = BlockedQuestsSchema.safeParse(blocked);
    if (!result.success) {
      throw new Error(
        `Invalid blocked quests: ${result.error.issues
          .map(i => i.message)
          .join(', ')}`
      );
    }
    this.blockedQuests = blocked;
  }

  getBlockedQuests(): BlockedQuests {
    return { ...this.blockedQuests };
  }

  blockQuest(questName: string): void {
    if (!this.blockedQuests.BlockQuestNames.includes(questName)) {
      this.blockedQuests.BlockQuestNames.push(questName);
    }
  }

  unblockQuest(questName: string): void {
    this.blockedQuests.BlockQuestNames =
      this.blockedQuests.BlockQuestNames.filter(name => name !== questName);
  }

  blockAllDefaultQuests(block: boolean = true): void {
    this.blockedQuests.BlockAllDefaultQuests = block;
  }

  // File operations
  createFolderStructure(): void {
    const folders = ['Blocked', 'Override', 'QuestList'];
    folders.forEach(folder => {
      const folderPath = join(this.basePath, folder);
      mkdirSync(folderPath, { recursive: true });
    });
  }

  exportToFiles(): void {
    this.createFolderStructure();

    // Export blocked quests
    const blockedPath = join(this.basePath, 'Blocked', 'BlockedQuests.json');
    writeFileSync(blockedPath, JSON.stringify(this.blockedQuests, null, 2));

    // Export custom quests to Override folder
    this.quests.forEach((quest, name) => {
      const questPath = join(this.basePath, 'Override', `${name}.json`);
      writeFileSync(questPath, JSON.stringify(quest, null, 2));
    });

    // Export quest list for reference
    const customQuestList = Array.from(this.quests.keys());
    const questListPath = join(
      this.basePath,
      'QuestList',
      'CustomQuestList.json'
    );
    writeFileSync(questListPath, JSON.stringify(customQuestList, null, 2));

    console.log(`✅ Exported ${this.quests.size} quests to ${this.basePath}`);
  }

  importFromFiles(): void {
    // Import blocked quests
    const blockedPath = join(this.basePath, 'Blocked', 'BlockedQuests.json');
    if (existsSync(blockedPath)) {
      try {
        const blockedData = JSON.parse(readFileSync(blockedPath, 'utf-8'));
        this.setBlockedQuests(blockedData);
      } catch (error) {
        console.warn(`Warning: Could not parse blocked quests: ${error}`);
      }
    }

    // Import custom quests from Override folder
    const overridePath = join(this.basePath, 'Override');
    if (existsSync(overridePath)) {
      const files = readdirSync(overridePath).filter((file: string) =>
        file.endsWith('.json')
      );

      files.forEach((file: string) => {
        try {
          const questData = JSON.parse(
            readFileSync(join(overridePath, file), 'utf-8')
          );
          const questName = file.replace('.json', '');
          this.addQuest(questName, questData);
        } catch (error) {
          console.warn(`Warning: Could not parse quest file ${file}: ${error}`);
        }
      });
    }

    console.log(`✅ Imported ${this.quests.size} quests from ${this.basePath}`);
  }

  // Utility methods
  validateAllQuests(): {
    valid: string[];
    invalid: Array<{ name: string; errors: string[] }>;
  } {
    const valid: string[] = [];
    const invalid: Array<{ name: string; errors: string[] }> = [];

    this.quests.forEach((quest, name) => {
      const result = QuestSchema.safeParse(quest);
      if (result.success) {
        valid.push(name);
      } else {
        invalid.push({
          name,
          errors: result.error.issues.map(
            i => `${i.path.join('.')}: ${i.message}`
          ),
        });
      }
    });

    return { valid, invalid };
  }

  getStats(): {
    totalQuests: number;
    blockedQuestNames: number;
    blockAllDefault: boolean;
  } {
    return {
      totalQuests: this.quests.size,
      blockedQuestNames: this.blockedQuests.BlockQuestNames.length,
      blockAllDefault: this.blockedQuests.BlockAllDefaultQuests,
    };
  }
}
