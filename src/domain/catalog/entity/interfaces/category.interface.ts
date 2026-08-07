import { ECategoryStatus } from '../enums/ECategoryStatus';

export interface ICategory {
  id: string;
  slug: string;
  name: string;
  synonyms: string[];
  parentId: string | null;
  status: ECategoryStatus;
  createdAt: Date;
  updatedAt?: Date;
}
