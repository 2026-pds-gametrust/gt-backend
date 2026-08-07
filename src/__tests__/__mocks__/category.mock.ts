import { Types } from 'mongoose';
import { ECategoryStatus } from '../../domain/catalog/entity/enums/ECategoryStatus';
import { ICategory } from '../../domain/catalog/entity/interfaces/category.interface';

export const validCategoryMock = (
  override?: Partial<ICategory>,
): ICategory => ({
  id: new Types.ObjectId().toHexString(),
  slug: `gpus-${Date.now()}`,
  name: `GPUs ${Date.now()}`,
  synonyms: ['placa de video'],
  parentId: null,
  status: ECategoryStatus.ACTIVE,
  createdAt: new Date(),
  ...override,
});
