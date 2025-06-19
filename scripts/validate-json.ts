import { QuestSchema } from '../src/schemas/quest';
import { BlockedQuestsSchema } from '../src/schemas/blocked-quests.js';
import { readFileSync } from 'fs';

const schemas = {
  quest: QuestSchema,
  'blocked-quests': BlockedQuestsSchema,
} as const;

function validateJson(jsonPath: string, schemaType: keyof typeof schemas) {
  console.log(`Validating ${jsonPath} with ${schemaType} schema`);
  const jsonContent = readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(jsonContent);

  const schema = schemas[schemaType];
  const result = schema.safeParse(data);

  if (result.success) {
    console.log('Valid!');
    return true;
  } else {
    console.error(`Validation failed for ${jsonPath}:`);
    result.error.issues.forEach(issue => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    return false;
  }
}

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node validate-json.ts <json-path> <schema-type>');
  process.exit(1);
}

const [jsonPath, schemaType] = args;
if (!(schemaType in schemas)) {
  console.error(`Invalid schema type: ${schemaType}`);
  process.exit(1);
}

const isValid = validateJson(jsonPath, schemaType as keyof typeof schemas);
process.exit(isValid ? 0 : 1);
