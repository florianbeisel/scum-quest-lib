import { Skill } from '../../schemas';
import type { Reward, TradeDeal } from '../../types';

export class RewardBuilder {
  private reward: Partial<Reward> = {};

  currency(normal?: number, gold?: number, fame?: number): this {
    if (normal !== undefined) this.reward.CurrencyNormal = normal;
    if (gold !== undefined) this.reward.CurrencyGold = gold;
    if (fame !== undefined) this.reward.Fame = fame;
    return this;
  }

  addSkill(skill: Skill, experience: number): this {
    if (!this.reward.Skills) this.reward.Skills = [];
    this.reward.Skills.push({ Skill: skill, Experience: experience });
    return this;
  }

  addTradeDeal(
    item: string,
    options: Partial<Omit<TradeDeal, 'Item'>> = {}
  ): this {
    if (!this.reward.TradeDeals) this.reward.TradeDeals = [];
    this.reward.TradeDeals.push({
      Item: item,
      ...options,
    });
    return this;
  }

  build(): Reward {
    return this.reward as Reward;
  }
}
