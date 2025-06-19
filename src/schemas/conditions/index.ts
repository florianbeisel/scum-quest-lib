import { z } from 'zod';

const BaseConditionSchema = z.object({
  CanBeAutoCompleted: z.boolean().default(false),
  TrackingCaption: z.string().optional(),
  SequenceIndex: z.number().int().min(0),
  LocationsShownOnMap: z
    .array(
      z.object({
        Location: z.union([
          z.object({
            X: z.number(),
            Y: z.number(),
            Z: z.number(),
          }),
          z.string(),
        ]),
        SizeFactor: z.number().positive().default(1.0),
      })
    )
    .optional(),
});

const EliminationConditionsSchema = BaseConditionSchema.extend({
  Type: z.literal('Elimination'),
  TargetCharacters: z.array(z.string()).min(1),
  Amount: z.number().int().min(1),
  AllowedWeapons: z.array(z.string()).optional(),
});

const CookLevel = z.enum([
  'Raw',
  'Undercooked',
  'Cooked',
  'Overcooked',
  'Burned',
]);
export type CookLevel = z.infer<typeof CookLevel>;

export const CookQuality = z.enum([
  'Ruined',
  'Bad',
  'Poor',
  'Good',
  'Excellent',
  'Perfect',
]);
export type CookQuality = z.infer<typeof CookQuality>;

const ItemRequirementSchema = z.object({
  AcceptedItems: z.array(z.string()).min(1),
  RequiredNum: z.number().int().min(1),
  RandomAdditionalRequiredNum: z.number().int().min(0).optional(),
  MinAcceptedItemUses: z.number().int().min(0).optional(),
  MinAcceptedCookLevel: CookLevel.optional(),
  MaxAcceptedCookLevel: CookLevel.optional(),
  MinAcceptedCookQuality: CookQuality.optional(),
  MinAcceptedItemMass: z.number().int().min(0).optional(),
  MinAcceptedItemHealth: z.number().int().min(0).max(100).optional(),
  MinAcceptedItemResourceRatio: z.number().int().min(0).max(100).optional(),
  MinAcceptedItemResourceAmount: z.number().int().min(0).optional(),
});

const FetchConditionSchema = BaseConditionSchema.extend({
  Type: z.literal('Fetch'),
  DisablePurchaseOfRequiredItems: z.boolean().default(false),
  PlayerKeepsItems: z.boolean().default(false),
  RequiredItems: z.array(ItemRequirementSchema).min(1),
});

const InteractionLocationSchema = z.object({
  AnchorMesh: z.string().min(1),
  Instance: z.number().int().optional(),
  FallbackTransform: z.string().optional(),
  VisibleMesh: z.string().optional(),
});

const InteractionConditionSchema = BaseConditionSchema.extend({
  Type: z.literal('Interaction'),
  Locations: z.array(InteractionLocationSchema).min(1),
  MinNeeded: z.number().int().min(1),
  MaxNeeded: z.number().int().min(1),
  SpawnOnlyNeeded: z.boolean().default(true),
  WorldMarkersShowDistance: z.number().int().min(0).default(50),
});

export const ConditionSchema = z
  .discriminatedUnion('Type', [
    EliminationConditionsSchema,
    FetchConditionSchema,
    InteractionConditionSchema,
  ])
  .refine(
    condition => {
      if (condition.Type === 'Interaction') {
        return condition.MinNeeded <= condition.MaxNeeded;
      }
      return true;
    },
    { message: 'MinNeeded must be less than or equal to MaxNeeded' }
  )
  .refine(
    condition => {
      if (condition.Type === 'Interaction') {
        return condition.MaxNeeded <= condition.Locations.length;
      }
      return true;
    },
    {
      message:
        'MaxNeeded must be less than or equal to the number of locations',
    }
  );

export type Condition = z.infer<typeof ConditionSchema>;
export type EliminationCondition = z.infer<typeof EliminationConditionsSchema>;
export type FetchCondition = z.infer<typeof FetchConditionSchema>;
export type InteractionCondition = z.infer<typeof InteractionConditionSchema>;
export type ItemRequirement = z.infer<typeof ItemRequirementSchema>;
export type InteractionLocation = z.infer<typeof InteractionLocationSchema>;

// Condition type constants
export const CONDITION_TYPES = ['Fetch', 'Elimination', 'Interaction'] as const;
export type ConditionType = (typeof CONDITION_TYPES)[number];

// Helper functions for condition conversion
export const extractConditionItems = (condition: Condition): string[] => {
  if (condition.Type === 'Fetch') {
    return condition.RequiredItems.flatMap(item => item.AcceptedItems);
  }
  if (condition.Type === 'Elimination') {
    return condition.TargetCharacters;
  }
  return [];
};

export const extractInteractionObjects = (condition: Condition): string[] => {
  if (condition.Type === 'Interaction') {
    return condition.Locations.map(location => location.AnchorMesh);
  }
  return [];
};

export const getConditionType = (condition: Condition): ConditionType => {
  return condition.Type;
};

export const isFetchCondition = (
  condition: Condition
): condition is FetchCondition => {
  return condition.Type === 'Fetch';
};

export const isEliminationCondition = (
  condition: Condition
): condition is EliminationCondition => {
  return condition.Type === 'Elimination';
};

export const isInteractionCondition = (
  condition: Condition
): condition is InteractionCondition => {
  return condition.Type === 'Interaction';
};
