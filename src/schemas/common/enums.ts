import { z } from 'zod';

export const NPCSchema = z.enum([
  'Armorer',
  'Banker',
  'Barber',
  'Bartender',
  'Doctor',
  'Fischerman',
  'GeneralGoods',
  'Mechanic',
]);

export const SkillSchema = z.enum([
  'Archery',
  'Aviation',
  'Awareness',
  'Boxing',
  'Camouflage',
  'Cooking',
  'Demolition',
  'Diving',
  'Endurance',
  'Engineering',
  'Farming',
  'Handgun',
  'Medical',
  'MeleeWeapons',
  'Motorcycle',
  'Rifles',
  'Running',
  'Sniping',
  'Stealth',
  'Survival',
  'Tactics',
  'Thievery',
]);

export type Skill = z.infer<typeof SkillSchema>;
export type NPC = z.infer<typeof NPCSchema>;
