import { z } from 'zod';
import { QuestSchema } from '../schemas/quest';
import { CONDITION_TYPES, ConditionSchema } from '../schemas/conditions';
import { RewardSchema } from '../schemas/rewards';
import type { Quest, Condition, Reward } from '../types';

// Form data types (using existing schemas)
export type QuestFormData = z.infer<typeof QuestSchema>;
export type ConditionFormData = z.infer<typeof ConditionSchema>;
export type RewardFormData = z.infer<typeof RewardSchema>;

// Conversion utilities
export const questToFormData = (quest: Quest): QuestFormData => {
  return {
    AssociatedNpc: quest.AssociatedNpc,
    AssociatedNPC: undefined, // Will be normalized by schema
    Tier: quest.Tier,
    Title: quest.Title,
    Description: quest.Description,
    TimeLimitHours: quest.TimeLimitHours,
    RewardPool: quest.RewardPool,
    Conditions: quest.Conditions,
  };
};

export const formDataToQuest = (formData: QuestFormData): Quest => {
  const result = QuestSchema.safeParse(formData);
  if (!result.success) {
    throw new Error(
      `Invalid quest form data: ${result.error.issues.map(i => i.message).join(', ')}`
    );
  }
  return result.data;
};

// Helper functions for form validation (using existing schemas)
export const validateQuestForm = (
  data: unknown
): { success: boolean; errors?: string[] } => {
  const result = QuestSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  return {
    success: false,
    errors: result.error.issues.map(
      issue => `${issue.path.join('.')}: ${issue.message}`
    ),
  };
};

export const validateConditionForm = (
  data: unknown
): { success: boolean; errors?: string[] } => {
  const result = ConditionSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  return {
    success: false,
    errors: result.error.issues.map(
      issue => `${issue.path.join('.')}: ${issue.message}`
    ),
  };
};

export const validateRewardForm = (
  data: unknown
): { success: boolean; errors?: string[] } => {
  const result = RewardSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  return {
    success: false,
    errors: result.error.issues.map(
      issue => `${issue.path.join('.')}: ${issue.message}`
    ),
  };
};

// Form-specific helper functions
export const getConditionTypeOptions = () => {
  return CONDITION_TYPES.map(type => ({ value: type, label: type }));
};

export const createEmptyCondition = (
  type: 'Fetch' | 'Elimination' | 'Interaction'
): Condition => {
  const baseCondition = {
    CanBeAutoCompleted: false,
    SequenceIndex: 0,
  };

  switch (type) {
    case 'Fetch':
      return {
        ...baseCondition,
        Type: 'Fetch',
        DisablePurchaseOfRequiredItems: false,
        PlayerKeepsItems: false,
        RequiredItems: [],
      } as Condition;
    case 'Elimination':
      return {
        ...baseCondition,
        Type: 'Elimination',
        TargetCharacters: [],
        Amount: 1,
      } as Condition;
    case 'Interaction':
      return {
        ...baseCondition,
        Type: 'Interaction',
        Locations: [],
        MinNeeded: 1,
        MaxNeeded: 1,
        SpawnOnlyNeeded: true,
        WorldMarkersShowDistance: 50,
      } as Condition;
    default:
      throw new Error(`Unknown condition type: ${type}`);
  }
};

export const createEmptyReward = (): Reward => {
  return {
    CurrencyNormal: 0,
    CurrencyGold: 0,
    Fame: 0,
  };
};
