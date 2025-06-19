import { CookLevel, CookQuality } from '../../schemas';
import type {
  Condition,
  FetchCondition,
  EliminationCondition,
} from '../../types';

export class ConditionBuilder {
  private condition: Partial<Condition> = {};
  private conditionType: 'Fetch' | 'Elimination' | 'Interaction' | null = null;

  // Set condition type
  asFetch(): this {
    this.conditionType = 'Fetch';
    (this.condition as Partial<Condition>).Type = 'Fetch';
    return this;
  }

  asElimination(): this {
    this.conditionType = 'Elimination';
    (this.condition as Partial<Condition>).Type = 'Elimination';
    return this;
  }

  asInteraction(): this {
    this.conditionType = 'Interaction';
    (this.condition as Partial<Condition>).Type = 'Interaction';
    return this;
  }

  // Common properties
  withSequenceIndex(index: number): this {
    this.condition.SequenceIndex = index;
    return this;
  }

  withCaption(caption: string): this {
    this.condition.TrackingCaption = caption;
    return this;
  }

  autoComplete(auto: boolean = true): this {
    this.condition.CanBeAutoCompleted = auto;
    return this;
  }

  disablePurchase(disable: boolean = true): this {
    if (this.conditionType !== 'Fetch') {
      throw new Error(
        'disablePurchase() can only be used with Fetch conditions'
      );
    }
    (this.condition as Partial<FetchCondition>).DisablePurchaseOfRequiredItems =
      disable;
    return this;
  }

  // Fetch-specific methods
  requireItems(items: string[], count: number): this {
    if (this.conditionType !== 'Fetch') {
      throw new Error('requireItems() can only be used with Fetch conditions');
    }
    const fetchCondition = this.condition as Partial<FetchCondition>;
    if (!fetchCondition.RequiredItems) fetchCondition.RequiredItems = [];
    fetchCondition.RequiredItems.push({
      AcceptedItems: items,
      RequiredNum: count,
    });
    return this;
  }

  // Add this method to the ConditionBuilder class:

  requireItemsWithOptions(
    items: string[],
    count: number,
    options: {
      minHealth?: number;
      minMass?: number;
      minUses?: number;
      cookLevel?: { min?: CookLevel; max?: CookLevel };
      cookQuality?: CookQuality;
      resourceRatio?: number;
      resourceAmount?: number;
    } = {}
  ): this {
    if (this.conditionType !== 'Fetch') {
      throw new Error(
        'requireItemsWithOptions() can only be used with Fetch conditions'
      );
    }
    const fetchCondition = this.condition as Partial<FetchCondition>;
    if (!fetchCondition.RequiredItems) fetchCondition.RequiredItems = [];

    const itemReq: FetchCondition['RequiredItems'][number] = {
      AcceptedItems: items,
      RequiredNum: count,
    };

    if (options.minHealth !== undefined)
      itemReq.MinAcceptedItemHealth = options.minHealth;
    if (options.minMass !== undefined)
      itemReq.MinAcceptedItemMass = options.minMass;
    if (options.minUses !== undefined)
      itemReq.MinAcceptedItemUses = options.minUses;
    if (options.cookLevel?.min)
      itemReq.MinAcceptedCookLevel = options.cookLevel.min;
    if (options.cookLevel?.max)
      itemReq.MaxAcceptedCookLevel = options.cookLevel.max;
    if (options.cookQuality)
      itemReq.MinAcceptedCookQuality = options.cookQuality;
    if (options.resourceRatio !== undefined)
      itemReq.MinAcceptedItemResourceRatio = options.resourceRatio;
    if (options.resourceAmount !== undefined)
      itemReq.MinAcceptedItemResourceAmount = options.resourceAmount;

    fetchCondition.RequiredItems.push(itemReq);
    return this;
  }

  requireItemsWithHealth(
    items: string[],
    count: number,
    minHealth: number
  ): this {
    if (this.conditionType !== 'Fetch') {
      throw new Error(
        'requireItemsWithHealth() can only be used with Fetch conditions'
      );
    }
    const fetchCondition = this.condition as Partial<FetchCondition>;
    if (!fetchCondition.RequiredItems) fetchCondition.RequiredItems = [];

    fetchCondition.RequiredItems.push({
      AcceptedItems: items,
      RequiredNum: count,
      MinAcceptedItemHealth: minHealth,
    });
    return this;
  }

  addMapLocation(
    X: number,
    Y: number,
    Z: number,
    sizeFactor: number = 1.0
  ): this {
    if (!this.condition.LocationsShownOnMap) {
      this.condition.LocationsShownOnMap = [];
    }
    this.condition.LocationsShownOnMap.push({
      Location: { X, Y, Z },
      SizeFactor: sizeFactor,
    });
    return this;
  }

  keepItems(keep: boolean = true): this {
    if (this.conditionType !== 'Fetch') {
      throw new Error('keepItems() can only be used with Fetch conditions');
    }
    (this.condition as Partial<FetchCondition>).PlayerKeepsItems = keep;
    return this;
  }

  // Elimination-specific methods
  eliminateTargets(targets: string[], count: number): this {
    if (this.conditionType !== 'Elimination') {
      throw new Error(
        'eliminateTargets() can only be used with Elimination conditions'
      );
    }
    const elimCondition = this.condition as Partial<EliminationCondition>;
    elimCondition.TargetCharacters = targets;
    elimCondition.Amount = count;
    return this;
  }

  withWeapons(weapons: string[]): this {
    if (this.conditionType !== 'Elimination') {
      throw new Error(
        'withWeapons() can only be used with Elimination conditions'
      );
    }
    (this.condition as Partial<EliminationCondition>).AllowedWeapons = weapons;
    return this;
  }

  build(): Condition {
    if (!this.conditionType) {
      throw new Error('Condition type must be set before building');
    }
    return this.condition as Condition;
  }
}
