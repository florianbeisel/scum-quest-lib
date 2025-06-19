# S.C.U.M. Quest Library

A TypeScript library for creating, validating, and managing quests for S.C.U.M. (Survive. Craft. Upgrade. Master.) game. This library provides a fluent builder pattern API for constructing quests with proper validation and JSON schema generation.

## Features

- **Builder Pattern API**: Fluent interface for creating quests, conditions, and rewards
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Validation**: Zod-based schema validation for all quest components
- **JSON Schema Generation**: Automatic generation of JSON schemas for external tools
- **Quest Management**: Import/export quests to/from game-compatible JSON files
- **Blocked Quests Support**: Manage which default quests to disable
- **CI/CD Pipeline**: Automated testing, linting, and semantic releases

## Installation

```bash
npm install scum-quest-library
# or
yarn add scum-quest-library
```

## Quick Start

### Basic Quest Creation

```typescript
import { QuestBuilder } from 'scum-quest-library';

const quest = new QuestBuilder()
  .withNPC('Bartender')
  .withTier(1)
  .withTitle('Apple Collection')
  .withDescription('Collect some apples for the bartender')
  .withTimeLimit(24)
  .addFetchCondition(condition =>
    condition
      .withSequenceIndex(0)
      .withCaption('Collect 3 apples')
      .requireItems(['Apple'], 3)
      .keepItems(true)
  )
  .addCurrencyReward(100, 1, 10)
  .build();
```

### Complex Quest with Multiple Conditions

```typescript
const complexQuest = new QuestBuilder()
  .withNPC('GeneralGoods')
  .withTier(3)
  .withTitle('Survival Challenge')
  .withDescription('A multi-step survival mission')
  .addFetchCondition(condition =>
    condition
      .withSequenceIndex(0)
      .withCaption('Collect 5 apples with 80% health')
      .requireItemsWithHealth(['Apple'], 5, 80)
      .addMapLocation(100, 200, 0, 1.5)
  )
  .addEliminationCondition(condition =>
    condition
      .withSequenceIndex(1)
      .withCaption('Eliminate 3 puppets with handguns')
      .eliminateTargets(['Puppet'], 3)
      .withWeapons(['BP_Weapon_M1911_C'])
  )
  .addReward(reward =>
    reward
      .currency(500, 5, 25)
      .addSkill('Survival', 100)
      .addTradeDeal('Weapon_M9', { Price: 50, Amount: 1 })
  )
  .build();
```

## Builder Pattern

The library uses a fluent builder pattern that provides type safety and validation at each step. Here's how it works:

### QuestBuilder

The main builder for creating quests:

```typescript
const quest = new QuestBuilder()
  // Basic properties
  .withNPC('Bartender') // Required: Associated NPC
  .withTier(1) // Required: Quest tier (1-3)
  .withTitle('Quest Title') // Required: Quest title
  .withDescription('Description') // Required: Quest description
  .withTimeLimit(24) // Optional: Time limit in hours

  // Add conditions
  .addFetchCondition(/* ... */)
  .addEliminationCondition(/* ... */)
  .addInteractionCondition(/* ... */)

  // Add rewards
  .addReward(/* ... */)
  .addCurrencyReward(100, 1, 10) // Quick currency reward

  // Build the quest
  .build();
```

### ConditionBuilder

For creating quest conditions:

```typescript
// Fetch Condition (collect items)
.addFetchCondition((condition) =>
  condition
    .withSequenceIndex(0)
    .withCaption("Collect items")
    .requireItems(["Apple", "Orange"], 5)
    .requireItemsWithHealth(["Apple"], 3, 80)
    .requireItemsWithOptions(["Apple"], 2, {
      minHealth: 90,
      minMass: 0.5,
      cookLevel: { min: "Raw", max: "Well Done" }
    })
    .keepItems(true)
    .disablePurchase(true)
    .addMapLocation(100, 200, 0, 1.5)
)

// Elimination Condition (kill targets)
.addEliminationCondition((condition) =>
  condition
    .withSequenceIndex(1)
    .withCaption("Eliminate targets")
    .eliminateTargets(["Puppet", "Zombie"], 10)
    .withWeapons(["BP_Weapon_M1911_C", "BP_Weapon_AK47_C"])
)

// Interaction Condition (interact with objects)
.addInteractionCondition((condition) =>
  condition
    .withSequenceIndex(2)
    .withCaption("Interact with object")
    .addMapLocation(150, 250, 0)
)
```

### RewardBuilder

For creating quest rewards:

```typescript
.addReward((reward) =>
  reward
    .currency(100, 1, 10)                    // Normal, Gold, Fame
    .addSkill("Survival", 50)                // Skill experience
    .addTradeDeal("Weapon_M9", {             // Trade deal
      Price: 50,
      Amount: 1,
      Fame: 5,
      AllowExcluded: false
    })
)
```

## Quest Management

### QuestCollection

Manage multiple quests and export them to game-compatible files:

```typescript
import { QuestCollection } from 'scum-quest-library';

const collection = new QuestCollection({
  basePath: './game/Quests',
  validateOnImport: true,
});

// Add quests
collection.addQuest('AppleQuest', quest1);
collection.addQuest('HunterQuest', quest2);

// Block default quests
collection.blockQuest('DefaultQuestName');
collection.blockAllDefaultQuests(true);

// Export to game files
collection.exportToFiles();
// Creates:
// - ./game/Quests/Blocked/BlockedQuests.json
// - ./game/Quests/Override/AppleQuest.json
// - ./game/Quests/Override/HunterQuest.json
// - ./game/Quests/QuestList/CustomQuestList.json

// Import from existing files
collection.importFromFiles();
```

## Schemas and Validation

### JSON Schemas

The library generates JSON schemas that can be used by external tools:

```typescript
// Access schemas
import questSchema from 'scum-quest-library/schemas';
```

Generated schemas are available in the `jsco-schemas/` directory:

- `quest.json` - Main quest schema
- `conditions.json` - Quest conditions schema
- `rewards.json` - Quest rewards schema
- `blocked-quests.json` - Blocked quests configuration schema

### Validation

All builders include validation:

```typescript
const builder = new QuestBuilder().withNPC('Bartender').withTitle('Test Quest');

// Validate before building
const validation = builder.validate();
if (!validation.success) {
  console.log('Validation errors:', validation.errors);
}

// Preview current state
const preview = builder.preview();
console.log('Current quest state:', preview);
```

## Quest Types

### Quest Structure

```typescript
interface Quest {
  AssociatedNpc: NPC; // Required: Associated NPC
  Tier: QuestTier; // Required: Quest difficulty tier (1-3)
  Title: string; // Required: Quest title
  Description: string; // Required: Quest description
  RewardPool: Reward[]; // Required: Array of rewards
  Conditions: Condition[]; // Required: Array of conditions
  TimeLimitHours?: number; // Optional: Time limit in hours
}
```

### QuestTier Type

The library exports a `QuestTier` type that represents valid quest difficulty tiers:

```typescript
import { QuestTier } from 'scum-quest-library';

// Valid tier values
const tier1: QuestTier = 1; // Easy
const tier2: QuestTier = 2; // Medium
const tier3: QuestTier = 3; // Hard

// TypeScript will error on invalid values
// const invalidTier: QuestTier = 4; // Error: Type '4' is not assignable to type '1 | 2 | 3'
// const invalidTier: QuestTier = 0; // Error: Type '0' is not assignable to type '1 | 2 | 3'
```

This allows consuming projects to use the same type without reimplementing the union type. The QuestTier is defined as `1 | 2 | 3` (literal number union) for maximum type safety.

### Condition Types

#### Fetch Condition

Collect specific items with optional requirements:

- Item requirements (type, count, health, mass, etc.)
- Map locations
- Auto-completion settings
- Purchase restrictions

#### Elimination Condition

Eliminate specific targets:

- Target characters
- Required amount
- Allowed weapons
- Map locations

#### Interaction Condition

Interact with specific objects:

- Map locations
- Auto-completion settings

### Reward Types

#### Currency Rewards

- Normal currency
- Gold currency
- Fame points

#### Skill Rewards

- Skill experience points
- Available skills: Archery, Aviation, Awareness, Boxing, etc.

#### Trade Deals

- Item availability
- Price and amount
- Fame requirements
- Exclusion settings

## Available NPCs

- Armorer
- Banker
- Barber
- Bartender
- Doctor
- Fischerman
- GeneralGoods
- Mechanic

## Available Skills

- Archery
- Aviation
- Awareness
- Boxing
- Camouflage
- Cooking
- Demolition
- Diving
- Endurance
- Engineering
- Farming
- Handgun
- Medical
- MeleeWeapons
- Motorcycle
- Rifles
- Running
- Sniping
- Stealth
- Survival
- Tactics
- Thievery

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment with semantic releases.

### Workflows

- **Commit Message Validation**: Validates commit messages follow conventional commit format
- **Test & Release**: Runs tests, linting, formatting checks, and creates releases

### Semantic Releases

The project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and releases. Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features (triggers minor release)
- `fix:` - Bug fixes (triggers patch release)
- `BREAKING CHANGE:` - Breaking changes (triggers major release)
- `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:` - Other changes (no release)

### Local Development

```bash
# Install dependencies
yarn install

# Run type checking
yarn type-check

# Run linting
yarn lint
yarn lint:fix

# Check formatting
yarn format:check
yarn format

# Run tests
yarn test
yarn test:coverage

# Build the project
yarn build

# Run all CI checks locally
yarn ci
```

### Required Secrets

To enable releases, you need to set up the following GitHub secrets:

- `NPM_TOKEN`: NPM authentication token for publishing packages
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Development

### Building

```bash
# Build the library
npm run build

# Generate JSON schemas
npm run generate-schema

# Run tests
npm test

# Type checking
npm run type-check
```

### Project Structure

```
src/
├── builders/           # Builder pattern implementations
│   ├── QuestBuilder.ts
│   ├── conditions/     # Condition builders
│   └── rewards/        # Reward builders
├── schemas/           # Zod schemas for validation
│   ├── quest/         # Quest schema
│   ├── conditions/    # Condition schemas
│   ├── rewards/       # Reward schemas
│   └── common/        # Shared schemas
├── types/             # TypeScript type definitions
├── parsers/           # Import/export functionality
└── utils/             # Utility functions

jsco-schemas/          # Generated JSON schemas
test/                  # Test files
scripts/               # Build and generation scripts
.github/workflows/     # GitHub Actions workflows
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the conventional commit format
4. Add tests for new functionality
5. Run the test suite (`yarn ci`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Commit Message Format

All commit messages must follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer(s)]
```

Examples:

- `feat: add new quest condition type`
- `fix(builder): resolve validation error in QuestBuilder`
- `docs: update README with new examples`
- `BREAKING CHANGE: rename QuestBuilder.withNPC to withAssociatedNPC`

## License

This project is licensed under the MIT License.
