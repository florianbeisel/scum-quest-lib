import { describe, it, expect } from 'vitest';
import {
  CONDITION_TYPES,
  extractConditionItems,
  extractInteractionObjects,
  isFetchCondition,
  isEliminationCondition,
  isInteractionCondition,
  questToFormData,
  formDataToQuest,
  validateQuestForm,
  createEmptyCondition,
  createEmptyReward,
  getConditionTypeOptions,
} from '../src/utils';
import { QuestBuilder } from '../src/builders';

describe('Utility Functions', () => {
  describe('CONDITION_TYPES', () => {
    it('should contain all condition types', () => {
      expect(CONDITION_TYPES).toEqual(['Fetch', 'Elimination', 'Interaction']);
    });
  });

  describe('extractConditionItems', () => {
    it('should extract items from fetch condition', () => {
      const fetchCondition = {
        Type: 'Fetch' as const,
        CanBeAutoCompleted: false,
        TrackingCaption: 'Find items',
        SequenceIndex: 0,
        DisablePurchaseOfRequiredItems: false,
        PlayerKeepsItems: false,
        RequiredItems: [
          { AcceptedItems: ['Apple'], RequiredNum: 1 },
          { AcceptedItems: ['Orange'], RequiredNum: 2 },
        ],
      };

      const items = extractConditionItems(fetchCondition);
      expect(items).toEqual(['Apple', 'Orange']);
    });

    it('should extract targets from elimination condition', () => {
      const eliminationCondition = {
        Type: 'Elimination' as const,
        CanBeAutoCompleted: false,
        TrackingCaption: 'Kill targets',
        SequenceIndex: 0,
        TargetCharacters: ['Puppet', 'Animal'],
        Amount: 5,
      };

      const items = extractConditionItems(eliminationCondition);
      expect(items).toEqual(['Puppet', 'Animal']);
    });

    it('should return empty array for interaction condition', () => {
      const interactionCondition = {
        Type: 'Interaction' as const,
        CanBeAutoCompleted: false,
        TrackingCaption: 'Interact with objects',
        SequenceIndex: 0,
        Locations: [
          { AnchorMesh: '/Game/Objects/Tree' },
          { AnchorMesh: '/Game/Objects/Rock' },
        ],
        MinNeeded: 1,
        MaxNeeded: 2,
        SpawnOnlyNeeded: true,
        WorldMarkersShowDistance: 50,
      };

      const items = extractConditionItems(interactionCondition);
      expect(items).toEqual([]);
    });
  });

  describe('extractInteractionObjects', () => {
    it('should extract anchor meshes from interaction condition', () => {
      const interactionCondition = {
        Type: 'Interaction' as const,
        CanBeAutoCompleted: false,
        TrackingCaption: 'Interact with objects',
        SequenceIndex: 0,
        Locations: [
          { AnchorMesh: '/Game/Objects/Tree', Instance: 1 },
          { AnchorMesh: '/Game/Objects/Rock', Instance: 2 },
        ],
        MinNeeded: 1,
        MaxNeeded: 2,
        SpawnOnlyNeeded: true,
        WorldMarkersShowDistance: 50,
      };

      const objects = extractInteractionObjects(interactionCondition);
      expect(objects).toEqual(['/Game/Objects/Tree', '/Game/Objects/Rock']);
    });

    it('should return empty array for non-interaction conditions', () => {
      const fetchCondition = {
        Type: 'Fetch' as const,
        CanBeAutoCompleted: false,
        TrackingCaption: 'Find items',
        SequenceIndex: 0,
        DisablePurchaseOfRequiredItems: false,
        PlayerKeepsItems: false,
        RequiredItems: [{ AcceptedItems: ['Apple'], RequiredNum: 1 }],
      };

      const objects = extractInteractionObjects(fetchCondition);
      expect(objects).toEqual([]);
    });
  });

  describe('Condition type guards', () => {
    it('should correctly identify fetch conditions', () => {
      const condition = {
        Type: 'Fetch' as const,
        CanBeAutoCompleted: false,
        TrackingCaption: 'Find items',
        SequenceIndex: 0,
        DisablePurchaseOfRequiredItems: false,
        PlayerKeepsItems: false,
        RequiredItems: [],
      };

      expect(isFetchCondition(condition)).toBe(true);
      expect(isEliminationCondition(condition)).toBe(false);
      expect(isInteractionCondition(condition)).toBe(false);
    });

    it('should correctly identify elimination conditions', () => {
      const condition = {
        Type: 'Elimination' as const,
        CanBeAutoCompleted: false,
        TrackingCaption: 'Kill targets',
        SequenceIndex: 0,
        TargetCharacters: ['Puppet'],
        Amount: 1,
      };

      expect(isFetchCondition(condition)).toBe(false);
      expect(isEliminationCondition(condition)).toBe(true);
      expect(isInteractionCondition(condition)).toBe(false);
    });

    it('should correctly identify interaction conditions', () => {
      const condition = {
        Type: 'Interaction' as const,
        CanBeAutoCompleted: false,
        TrackingCaption: 'Interact with objects',
        SequenceIndex: 0,
        Locations: [],
        MinNeeded: 1,
        MaxNeeded: 1,
        SpawnOnlyNeeded: true,
        WorldMarkersShowDistance: 50,
      };

      expect(isFetchCondition(condition)).toBe(false);
      expect(isEliminationCondition(condition)).toBe(false);
      expect(isInteractionCondition(condition)).toBe(true);
    });
  });

  describe('Form Schemas and Conversion', () => {
    it('should convert quest to form data', () => {
      const quest = new QuestBuilder()
        .withNPC('Bartender')
        .withTier(1)
        .withTitle('Test Quest')
        .withDescription('A test quest')
        .withTimeLimit(24)
        .addFetchCondition(c =>
          c
            .withSequenceIndex(0)
            .withCaption('Find 1 apple')
            .requireItems(['Apple'], 1)
        )
        .addCurrencyReward(100)
        .build();

      const formData = questToFormData(quest);

      expect(formData.AssociatedNpc).toBe('Bartender');
      expect(formData.Tier).toBe(1);
      expect(formData.Title).toBe('Test Quest');
      expect(formData.Description).toBe('A test quest');
      expect(formData.Conditions).toHaveLength(1);
      expect(formData.RewardPool).toHaveLength(1);
    });

    it('should convert form data back to quest', () => {
      const formData = {
        AssociatedNpc: 'GeneralGoods',
        AssociatedNPC: undefined,
        Tier: 2 as const,
        Title: 'Form Test Quest',
        Description: 'Testing form conversion',
        TimeLimitHours: 48,
        Conditions: [
          {
            Type: 'Fetch' as const,
            CanBeAutoCompleted: false,
            TrackingCaption: 'Find 1 apple',
            SequenceIndex: 0,
            DisablePurchaseOfRequiredItems: false,
            PlayerKeepsItems: false,
            RequiredItems: [{ AcceptedItems: ['Apple'], RequiredNum: 1 }],
          },
        ],
        RewardPool: [
          {
            CurrencyNormal: 200,
          },
        ],
      };

      const quest = formDataToQuest(formData);

      expect(quest.AssociatedNpc).toBe('GeneralGoods');
      expect(quest.Tier).toBe(2);
      expect(quest.Title).toBe('Form Test Quest');
    });

    it('should validate quest form data', () => {
      const validData = {
        AssociatedNpc: 'Bartender',
        AssociatedNPC: undefined,
        Tier: 1 as const,
        Title: 'Valid Quest',
        Description: 'A valid quest',
        TimeLimitHours: 24,
        Conditions: [
          {
            Type: 'Fetch' as const,
            CanBeAutoCompleted: false,
            TrackingCaption: 'Find 1 apple',
            SequenceIndex: 0,
            DisablePurchaseOfRequiredItems: false,
            PlayerKeepsItems: false,
            RequiredItems: [{ AcceptedItems: ['Apple'], RequiredNum: 1 }],
          },
        ],
        RewardPool: [{ CurrencyNormal: 100 }],
      };

      const result = validateQuestForm(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid quest form data', () => {
      const invalidData = {
        AssociatedNpc: '', // Invalid: empty string
        Tier: 4, // Invalid: out of range
        Title: '', // Invalid: empty string
        Description: '', // Invalid: empty string
        Conditions: [], // Invalid: empty array
        RewardPool: [], // Invalid: empty array
      };

      const result = validateQuestForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('Helper Functions', () => {
    it('should create empty conditions', () => {
      const fetchCondition = createEmptyCondition('Fetch');
      expect(fetchCondition.Type).toBe('Fetch');
      if (isFetchCondition(fetchCondition)) {
        expect(fetchCondition.RequiredItems).toEqual([]);
      }

      const eliminationCondition = createEmptyCondition('Elimination');
      expect(eliminationCondition.Type).toBe('Elimination');
      if (isEliminationCondition(eliminationCondition)) {
        expect(eliminationCondition.TargetCharacters).toEqual([]);
      }

      const interactionCondition = createEmptyCondition('Interaction');
      expect(interactionCondition.Type).toBe('Interaction');
      if (isInteractionCondition(interactionCondition)) {
        expect(interactionCondition.Locations).toEqual([]);
      }
    });

    it('should create empty reward', () => {
      const reward = createEmptyReward();
      expect(reward.CurrencyNormal).toBe(0);
      expect(reward.CurrencyGold).toBe(0);
      expect(reward.Fame).toBe(0);
    });

    it('should get condition type options', () => {
      const options = getConditionTypeOptions();
      expect(options).toEqual([
        { value: 'Fetch', label: 'Fetch' },
        { value: 'Elimination', label: 'Elimination' },
        { value: 'Interaction', label: 'Interaction' },
      ]);
    });
  });
});
