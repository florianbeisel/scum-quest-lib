import { QuestSchema } from '../schemas/quest/index.js';
import { ConditionBuilder } from './conditions/index.js';
import { RewardBuilder } from './rewards/index.js';
import type { Quest, Condition, NPC } from '../types';

export class QuestBuilder {
  private quest: Partial<Quest> = {
    RewardPool: [],
    Conditions: [],
  };

  // Basic quest properties
  withNPC(npc: NPC): this {
    this.quest.AssociatedNpc = npc;
    return this;
  }

  withTier(tier: 1 | 2 | 3): this {
    this.quest.Tier = tier;
    return this;
  }

  withTitle(title: string): this {
    this.quest.Title = title;
    return this;
  }

  withDescription(description: string): this {
    this.quest.Description = description;
    return this;
  }

  withTimeLimit(hours: number): this {
    this.quest.TimeLimitHours = hours;
    return this;
  }

  // Condition builders
  addCondition(builderFn: (builder: ConditionBuilder) => Condition): this {
    const conditionBuilder = new ConditionBuilder();
    const condition = builderFn(conditionBuilder);
    this.quest.Conditions!.push(condition);
    return this;
  }

  addFetchCondition(
    builderFn: (builder: ConditionBuilder) => ConditionBuilder
  ): this {
    const conditionBuilder = new ConditionBuilder().asFetch();
    const finalBuilder = builderFn(conditionBuilder);
    this.quest.Conditions!.push(finalBuilder.build());
    return this;
  }

  addEliminationCondition(
    builderFn: (builder: ConditionBuilder) => ConditionBuilder
  ): this {
    const conditionBuilder = new ConditionBuilder().asElimination();
    const finalBuilder = builderFn(conditionBuilder);
    this.quest.Conditions!.push(finalBuilder.build());
    return this;
  }

  addInteractionCondition(
    builderFn: (builder: ConditionBuilder) => ConditionBuilder
  ): this {
    const conditionBuilder = new ConditionBuilder().asInteraction();
    const finalBuilder = builderFn(conditionBuilder);
    this.quest.Conditions!.push(finalBuilder.build());
    return this;
  }

  // Reward builders
  addReward(builderFn: (builder: RewardBuilder) => RewardBuilder): this {
    const rewardBuilder = new RewardBuilder();
    const finalBuilder = builderFn(rewardBuilder);
    this.quest.RewardPool!.push(finalBuilder.build());
    return this;
  }

  // Quick reward helpers
  addCurrencyReward(normal?: number, gold?: number, fame?: number): this {
    return this.addReward(builder => builder.currency(normal, gold, fame));
  }

  // Validation and building
  validate(): { success: boolean; errors?: string[] } {
    const result = QuestSchema.safeParse(this.quest);
    if (result.success) {
      return { success: true };
    }
    return {
      success: false,
      errors: result.error.issues.map(
        issue => `${issue.path.join('.')}: ${issue.message}`
      ),
    };
  }

  build(): Quest {
    const result = QuestSchema.parse(this.quest);
    return result;
  }

  // Get current state for debugging
  preview(): Partial<Quest> {
    return { ...this.quest };
  }
}
