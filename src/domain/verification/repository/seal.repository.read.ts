import { ISeal } from '../entity/interfaces/seal.interface';

export interface ISealRepositoryRead {
  findSealById(id: string): Promise<ISeal | null>;
  findActiveSealByListingId(listingId: string): Promise<ISeal | null>;
  listSealsByListingId(listingId: string): Promise<ISeal[]>;
  listActiveSealsByListingIds(listingIds: string[]): Promise<ISeal[]>;
}
