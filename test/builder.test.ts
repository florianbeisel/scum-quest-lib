import { describe, it, expect } from 'vitest';
import { QuestBuilder } from '../src/builders';
import { EliminationCondition } from '../src/types';

describe('QuestBuilder', () => {
  it('should build a simple fetch quest', () => {
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

    expect(quest.AssociatedNpc).toBe('Bartender');
    expect(quest.Tier).toBe(1);
    expect(quest.Title).toBe('Apple Collection');
    expect(quest.Conditions).toHaveLength(1);
    expect(quest.Conditions[0].Type).toBe('Fetch');
    expect(quest.RewardPool).toHaveLength(1);
    expect(quest.RewardPool[0].CurrencyNormal).toBe(100);
  });

  it('should build an elimination quest', () => {
    const quest = new QuestBuilder()
      .withNPC('Armorer')
      .withTier(2)
      .withTitle('Puppet Hunter')
      .withDescription('Eliminate puppets with specific weapons')
      .withTimeLimit(48)
      .addEliminationCondition(condition =>
        condition
          .withSequenceIndex(0)
          .withCaption('Kill 5 puppets')
          .eliminateTargets(['Puppet'], 5)
          .withWeapons(['BP_Weapon_M1911_C'])
      )
      .addReward(reward => reward.currency(200, 2, 15).addSkill('Handgun', 50))
      .build();

    expect(quest.AssociatedNpc).toBe('Armorer');
    expect(quest.Conditions[0].Type).toBe('Elimination');
    expect((quest.Conditions[0] as EliminationCondition).Amount).toBe(5);
    expect(quest.RewardPool[0].Skills).toHaveLength(1);
    expect(quest.RewardPool[0].Skills![0].Skill).toBe('Handgun');
  });

  it('should validate quest before building', () => {
    const builder = new QuestBuilder()
      .withNPC('Bartender')
      .withTitle('Incomplete Quest');

    const validation = builder.validate();
    expect(validation.success).toBe(false);
    expect(validation.errors).toBeDefined();
  });

  it('should allow previewing quest state', () => {
    const builder = new QuestBuilder()
      .withNPC('Bartender')
      .withTitle('Preview Test');

    const preview = builder.preview();
    expect(preview.AssociatedNpc).toBe('Bartender');
    expect(preview.Title).toBe('Preview Test');
    expect(preview.Tier).toBeUndefined(); // Not set yet
  });

  it('should build complex quest with multiple conditions and rewards', () => {
    const quest = new QuestBuilder()
      .withNPC('GeneralGoods')
      .withTier(3)
      .withTitle('Complex Mission')
      .withDescription('A multi-step quest')
      .withTimeLimit(72)
      .addFetchCondition(condition =>
        condition
          .withSequenceIndex(0)
          .withCaption('Collect 2 apples')
          .requireItems(['Apple'], 2)
      )
      .addEliminationCondition(condition =>
        condition
          .withSequenceIndex(1)
          .withCaption('Kill 3 puppets')
          .eliminateTargets(['Puppet'], 3)
      )
      .addReward(reward =>
        reward
          .currency(500)
          .addSkill('Survival', 100)
          .addTradeDeal('Weapon_M9', { Price: 50, Amount: 1 })
      )
      .build();

    expect(quest.Conditions).toHaveLength(2);
    expect(quest.Conditions[0].SequenceIndex).toBe(0);
    expect(quest.Conditions[1].SequenceIndex).toBe(1);
    expect(quest.RewardPool[0].TradeDeals).toHaveLength(1);
  });

  it('should throw error when using wrong condition methods', () => {
    expect(() => {
      new QuestBuilder().addEliminationCondition(
        condition => condition.requireItems(['Apple'], 3) // Wrong method for elimination
      );
    }).toThrow('requireItems() can only be used with Fetch conditions');
  });
});
