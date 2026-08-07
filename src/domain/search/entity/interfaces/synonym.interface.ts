import { ESynonymTargetType } from '../enums/ESynonymTargetType';

export interface ISynonym {
  id: string;
  normalizedTerm: string;
  targetType: ESynonymTargetType;
  targetId: string;
  canonicalName: string;
  updatedAt?: Date;
}
