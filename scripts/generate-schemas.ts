import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { BlockedQuestsSchema } from '../src/schemas/blocked-quests';
import { QuestSchema } from '../src/schemas/quest';
import { ConditionSchema } from '../src/schemas/conditions';
import { RewardSchema } from '../src/schemas/rewards';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = resolve(__dirname, '../jsco-schemas');
mkdirSync(outputDir, { recursive: true });

const schemas = {
  'quest.json': QuestSchema,
  'blocked-quests.json': BlockedQuestsSchema,
  'conditions.json': ConditionSchema,
  'rewards.json': RewardSchema,
};

Object.entries(schemas).forEach(([fileName, schema]) => {
  const jsonSchema = zodToJsonSchema(schema, {
    name: fileName.replace('.json', ''),
    $refStrategy: 'none',
  });

  const outputPath = resolve(outputDir, `${fileName}`);
  writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2));
  console.log(`Generated schema: ${outputPath}`);
});

console.log('Schemas generated successfully');
