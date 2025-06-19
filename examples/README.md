# Example Quests

This directory contains example quest files that can be used for:

- **Testing**: Validating the library's parsing, building, and validation capabilities
- **Documentation**: Showing real-world usage examples
- **Distribution**: Providing working examples alongside the library

## Available Examples

### `general-goods-quest.json`

A basic fetch quest where the player must collect apples for a trader. This example demonstrates:

- Basic quest structure with NPC association
- Fetch conditions with item requirements
- Reward pools with currency, skills, and trade deals
- Location markers on the map

## Usage in Tests

These examples are used in the test suite to ensure the library correctly handles real-world quest data. See `test/real-quest.test.ts` for examples of how to use these files in your tests.

## Adding New Examples

When adding new example quests:

1. Use descriptive filenames that indicate the quest type or theme
2. Include a variety of quest types to demonstrate different features
3. Ensure the quests are valid according to the library's schemas
4. Update this README with a description of what the example demonstrates

## Schema Validation

All example quests should pass validation against the library's schemas. You can validate them using:

```bash
yarn validate examples/*.json
```
