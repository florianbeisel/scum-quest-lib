import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { QuestSchema } from '../src/schemas/quest';
import { BlockedQuestsSchema } from '../src/schemas/blocked-quests';
import { z } from 'zod';

const examplesDir = path.join(__dirname, '..', 'examples');

// Schema for QuestList files (array of strings)
const QuestListSchema = z.array(z.string());

describe('Examples Directory Structure', () => {
  it('should have the correct directory structure', () => {
    const dirs = fs.readdirSync(examplesDir);

    expect(dirs).toContain('Override');
    expect(dirs).toContain('Blocked');
    expect(dirs).toContain('QuestList');
    expect(dirs).toContain('README.md');
  });

  it('should validate all quest files in Override directory', () => {
    const overrideDir = path.join(examplesDir, 'Override');
    const questFiles = fs
      .readdirSync(overrideDir)
      .filter(file => file.endsWith('.json'));

    expect(questFiles.length).toBeGreaterThan(0);

    questFiles.forEach(questFile => {
      const filePath = path.join(overrideDir, questFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const quest = JSON.parse(content);

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

      // Verify normalization worked
      if (result.success) {
        expect(result.data.AssociatedNpc).toBeDefined();
        expect(result.data.AssociatedNPC).toBeUndefined();
      }
    });
  });

  it('should validate all blocked quest files in Blocked directory', () => {
    const blockedDir = path.join(examplesDir, 'Blocked');
    const blockedFiles = fs
      .readdirSync(blockedDir)
      .filter(file => file.endsWith('.json'));

    expect(blockedFiles.length).toBeGreaterThan(0);

    blockedFiles.forEach(blockedFile => {
      const filePath = path.join(blockedDir, blockedFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const blockedQuests = JSON.parse(content);

      const result = BlockedQuestsSchema.safeParse(blockedQuests);

      if (!result.success) {
        console.log(`Validation failed for ${blockedFile}:`);
        result.error.issues.forEach((issue, i) => {
          console.log(
            `  ${i + 1}. Path: ${issue.path.join('.')} - ${issue.message}`
          );
        });
      }

      expect(
        result.success,
        `Blocked quests file ${blockedFile} should be valid`
      ).toBe(true);
    });
  });

  it('should validate all quest list files in QuestList directory', () => {
    const questListDir = path.join(examplesDir, 'QuestList');
    const questListFiles = fs
      .readdirSync(questListDir)
      .filter(file => file.endsWith('.json'));

    expect(questListFiles.length).toBeGreaterThan(0);

    questListFiles.forEach(questListFile => {
      const filePath = path.join(questListDir, questListFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const questList = JSON.parse(content);

      const result = QuestListSchema.safeParse(questList);

      if (!result.success) {
        console.log(`Validation failed for ${questListFile}:`);
        result.error.issues.forEach((issue, i) => {
          console.log(
            `  ${i + 1}. Path: ${issue.path.join('.')} - ${issue.message}`
          );
        });
      }

      expect(
        result.success,
        `Quest list file ${questListFile} should be valid`
      ).toBe(true);

      // Verify all entries are strings
      if (result.success) {
        result.data.forEach((entry: string) => {
          expect(typeof entry).toBe('string');
          expect(entry.length).toBeGreaterThan(0);
        });
      }
    });
  });

  it('should have valid JSON syntax in all files', () => {
    const validateJsonFile = (filePath: string) => {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        JSON.parse(content);
        return true;
      } catch (error) {
        console.log(`JSON parse error in ${filePath}: ${error}`);
        return false;
      }
    };

    const validateDirectory = (dirPath: string) => {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          validateDirectory(itemPath);
        } else if (item.endsWith('.json')) {
          expect(
            validateJsonFile(itemPath),
            `JSON file ${itemPath} should be valid`
          ).toBe(true);
        }
      }
    };

    validateDirectory(examplesDir);
  });
});
