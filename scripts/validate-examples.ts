#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { QuestSchema } from '../src/schemas/quest';
import { BlockedQuestsSchema } from '../src/schemas/blocked-quests';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const examplesDir = path.join(__dirname, '..', 'examples');

// Schema for QuestList files (array of strings)
const QuestListSchema = z.array(z.string());

interface ValidationResult {
  file: string;
  valid: boolean;
  errors?: string[];
}

function validateFile(filePath: string, schema: z.ZodSchema): ValidationResult {
  const fileName = path.basename(filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const result = schema.safeParse(data);

    if (result.success) {
      return { file: fileName, valid: true };
    } else {
      return {
        file: fileName,
        valid: false,
        errors: result.error.issues.map(
          issue => `${issue.path.join('.')}: ${issue.message}`
        ),
      };
    }
  } catch (error) {
    return {
      file: fileName,
      valid: false,
      errors: [`JSON parse error: ${error}`],
    };
  }
}

function validateDirectory(dirPath: string): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Recursively validate subdirectories
      results.push(...validateDirectory(itemPath));
    } else if (item.endsWith('.json')) {
      // Determine schema based on directory structure
      const relativePath = path.relative(examplesDir, itemPath);
      const dirName = path.dirname(relativePath).split(path.sep)[0];

      let schema: z.ZodSchema;

      switch (dirName) {
        case 'Override':
          schema = QuestSchema;
          break;
        case 'Blocked':
          schema = BlockedQuestsSchema;
          break;
        case 'QuestList':
          schema = QuestListSchema;
          break;
        default:
          // For files directly in examples/ or unknown subdirectories, try Quest schema
          schema = QuestSchema;
      }

      results.push(validateFile(itemPath, schema));
    }
  }

  return results;
}

console.log('Validating example quests...\n');

const results = validateDirectory(examplesDir);

// Group results by type for better reporting
const questResults = results.filter(
  r =>
    r.file.includes('Override') ||
    (!r.file.includes('Blocked') && !r.file.includes('QuestList'))
);
const blockedResults = results.filter(r => r.file.includes('Blocked'));
const questListResults = results.filter(r => r.file.includes('QuestList'));

// Report results
if (questResults.length > 0) {
  console.log('📋 Quest Files:');
  questResults.forEach(result => {
    if (result.valid) {
      console.log(`  ✅ ${result.file} - Valid`);
    } else {
      console.log(`  ❌ ${result.file} - Invalid`);
      result.errors?.forEach(error => {
        console.log(`    - ${error}`);
      });
    }
  });
  console.log('');
}

if (blockedResults.length > 0) {
  console.log('🚫 Blocked Quest Files:');
  blockedResults.forEach(result => {
    if (result.valid) {
      console.log(`  ✅ ${result.file} - Valid`);
    } else {
      console.log(`  ❌ ${result.file} - Invalid`);
      result.errors?.forEach(error => {
        console.log(`    - ${error}`);
      });
    }
  });
  console.log('');
}

if (questListResults.length > 0) {
  console.log('📝 Quest List Files:');
  questListResults.forEach(result => {
    if (result.valid) {
      console.log(`  ✅ ${result.file} - Valid`);
    } else {
      console.log(`  ❌ ${result.file} - Invalid`);
      result.errors?.forEach(error => {
        console.log(`    - ${error}`);
      });
    }
  });
  console.log('');
}

const validCount = results.filter(r => r.valid).length;
const totalCount = results.length;
const allValid = validCount === totalCount;

console.log(`📊 Summary: ${validCount}/${totalCount} files valid`);
console.log(
  '\n' +
    (allValid
      ? '🎉 All examples are valid!'
      : '💥 Some examples have validation errors.')
);

process.exit(allValid ? 0 : 1);
