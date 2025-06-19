# Example Quests

This directory contains example quest files that can be used for:

- **Testing**: Validating the library's parsing, building, and validation capabilities
- **Documentation**: Showing real-world usage examples
- **Distribution**: Providing working examples alongside the library

## Directory Structure

The examples follow the game's quest structure:

```
examples/
├── Override/          # Individual quest JSON files
├── Blocked/           # Blocked quests configuration
├── QuestList/         # Quest list files (arrays of quest paths)
└── README.md          # This file
```

## Available Examples

### Override/ (Quest Files)

Individual quest files that demonstrate different quest types:

- **`general-goods-quest.json`**: Basic fetch quest for collecting apples
- **`Example_Elimination.json`**: Elimination quest for killing puppets/animals
- **`Example_Fetch.json`**: Complex fetch quest with multiple conditions
- **`Example_Interact.json`**: Interaction quest with map markers and trade deals

### Blocked/ (Blocked Quests)

- **`BlockedQuests.json`**: Configuration for blocking specific quests

### QuestList/ (Quest Lists)

- **`CustomQuestList.json`**: List of custom quest paths
- **`DefaultQuestList.json`**: List of default quest paths

## Usage in Tests

These examples are used in the test suite to ensure the library correctly handles real-world quest data:

- **`test/real-quest.test.ts`**: Tests individual quest validation and builder reconstruction
- **`test/examples.test.ts`**: Comprehensive validation of the entire examples directory structure

## Adding New Examples

When adding new example quests:

1. **Quest files**: Place in `Override/` directory with descriptive filenames
2. **Blocked quests**: Place in `Blocked/` directory
3. **Quest lists**: Place in `QuestList/` directory
4. Ensure all files are valid according to the library's schemas
5. Update this README with descriptions of new examples

## Schema Validation

All example quests are automatically validated against the library's schemas. You can validate them using:

```bash
# Validate all examples
yarn validate-examples

# Run comprehensive tests
yarn test test/examples.test.ts
```

## Compatibility

The library supports both `AssociatedNPC` and `AssociatedNpc` field names for maximum compatibility with quests exported from the game. All quests are automatically normalized to use `AssociatedNpc` internally.
