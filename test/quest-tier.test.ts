import { describe, it, expect } from 'vitest';
import { QuestTier, QuestTierSchema } from '../src/schemas/quest';
import { QuestTier as QuestTierFromTypes } from '../src/types';
import { QuestBuilder } from '../src/builders';

describe('QuestTier Type', () => {
  it('should be properly exported from schemas', () => {
    // Test that the type is exported
    const validTier: QuestTier = 1;
    expect(validTier).toBe(1);
  });

  it('should be properly exported from types', () => {
    // Test that the type is exported from the main types
    const validTier: QuestTierFromTypes = 2;
    expect(validTier).toBe(2);
  });

  it('should validate correct tier values', () => {
    expect(QuestTierSchema.safeParse(1).success).toBe(true);
    expect(QuestTierSchema.safeParse(2).success).toBe(true);
    expect(QuestTierSchema.safeParse(3).success).toBe(true);
  });

  it('should reject invalid tier values', () => {
    expect(QuestTierSchema.safeParse(0).success).toBe(false);
    expect(QuestTierSchema.safeParse(4).success).toBe(false);
    expect(QuestTierSchema.safeParse(1.5).success).toBe(false);
    expect(QuestTierSchema.safeParse('1').success).toBe(false);
    expect(QuestTierSchema.safeParse('2').success).toBe(false);
    expect(QuestTierSchema.safeParse('3').success).toBe(false);
  });

  it('should work in quest context', () => {
    const questWithTier: { Tier: QuestTier } = {
      Tier: 3,
    };
    expect(questWithTier.Tier).toBe(3);
  });

  it('should work with QuestBuilder', () => {
    const builder = new QuestBuilder();

    // Should accept valid tiers
    builder.withTier(1);
    builder.withTier(2);
    builder.withTier(3);

    // TypeScript should prevent invalid tiers at compile time
    // builder.withTier(4); // This should cause a TypeScript error
  });
});
