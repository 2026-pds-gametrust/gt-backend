import { requireNonEmptyString } from '../../common/types/required-string';
import { ESynonymTargetType } from './enums/ESynonymTargetType';
import { ISynonym } from './interfaces/synonym.interface';

export class SynonymServiceEntity implements ISynonym {
  id: string;
  normalizedTerm: string;
  targetType: ESynonymTargetType;
  targetId: string;
  canonicalName: string;
  updatedAt?: Date;

  constructor(synonym: ISynonym) {
    this.validate(synonym);
    this.id = synonym.id;
    this.normalizedTerm = synonym.normalizedTerm;
    this.targetType = synonym.targetType;
    this.targetId = synonym.targetId;
    this.canonicalName = synonym.canonicalName.trim();
    this.updatedAt = synonym.updatedAt;
  }

  private validate(synonym: ISynonym): void {
    requireNonEmptyString(synonym.id, 'id');
    requireNonEmptyString(synonym.normalizedTerm, 'normalizedTerm');
    if (!synonym.targetType) throw new Error('targetType is required');
    requireNonEmptyString(synonym.targetId, 'targetId');
    requireNonEmptyString(synonym.canonicalName, 'canonicalName');
  }
}
