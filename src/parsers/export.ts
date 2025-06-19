import type { Quest, BlockedQuests } from '../types/index.js';
import { writeFileSync } from 'fs';

export function questToJson(quest: Quest, pretty: boolean = true): string {
  return JSON.stringify(quest, null, pretty ? 2 : 0);
}

export function blockedQuestsToJson(
  blocked: BlockedQuests,
  pretty: boolean = true
): string {
  return JSON.stringify(blocked, null, pretty ? 2 : 0);
}

export function questToFile(quest: Quest, filePath: string): void {
  writeFileSync(filePath, questToJson(quest));
}

export function blockedQuestsToFile(
  blocked: BlockedQuests,
  filePath: string
): void {
  writeFileSync(filePath, blockedQuestsToJson(blocked));
}
