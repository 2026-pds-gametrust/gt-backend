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
    if (!synonym.id?.trim()) throw new Error('id is required');
    if (!synonym.normalizedTerm?.trim()) {
      throw new Error('normalizedTerm is required');
    }
    if (!synonym.targetType) throw new Error('targetType is required');
    if (!synonym.targetId?.trim()) throw new Error('targetId is required');
    if (!synonym.canonicalName?.trim()) {
      throw new Error('canonicalName is required');
    }
  }
}
