import { readFileSync } from 'fs';
import type { Quest, BlockedQuests } from '../types/index.js';
import { QuestSchema } from '../schemas/quest/index.js';
import { BlockedQuestsSchema } from '../schemas/blocked-quests.js';

export function parseQuestFromFile(filePath: string): Quest {
  const content = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  return QuestSchema.parse(data);
}

export function parseQuestFromString(jsonString: string): Quest {
  const data = JSON.parse(jsonString);
  return QuestSchema.parse(data);
}

export function parseBlockedQuestsFromFile(filePath: string): BlockedQuests {
  const content = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  return BlockedQuestsSchema.parse(data);
}

export function parseBlockedQuestsFromString(
  jsonString: string
): BlockedQuests {
  const data = JSON.parse(jsonString);
  return BlockedQuestsSchema.parse(data);
}

// Safe parsing versions that return errors instead of throwing
export function safeParseQuest(
  jsonString: string
): { success: true; data: Quest } | { success: false; errors: string[] } {
  try {
    const data = JSON.parse(jsonString);
    const result = QuestSchema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        errors: result.error.issues.map(
          i => `${i.path.join('.')}: ${i.message}`
        ),
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        `JSON Parse Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}
