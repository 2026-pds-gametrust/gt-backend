import { ISeal } from '../entity/interfaces/seal.interface';

export interface ISealRepositoryWrite {
  createSeal(seal: ISeal): Promise<ISeal>;
  updateSealById(id: string, data: Partial<ISeal>): Promise<ISeal | null>;
}
