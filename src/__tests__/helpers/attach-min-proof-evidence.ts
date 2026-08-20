import { Types } from 'mongoose';
import { EvidenceItemService } from '../../domain/verification/service/evidence-item.service';
import { EEvidenceType } from '../../domain/verification/entity/enums/EEvidenceType';
import { sellerActor } from '../__mocks__/actor.mock';

export async function attachMinProofEvidence(
  evidenceItemService: EvidenceItemService,
  caseId: string,
  sellerId: string,
): Promise<void> {
  await evidenceItemService.addEvidence(
    {
      id: new Types.ObjectId().toHexString(),
      caseId,
      type: EEvidenceType.PHOTO,
      storageKey: 'private/evidence/photo.jpg',
    },
    sellerActor(sellerId),
  );
  await evidenceItemService.addEvidence(
    {
      id: new Types.ObjectId().toHexString(),
      caseId,
      type: EEvidenceType.VIDEO,
      storageKey: 'private/evidence/video.mp4',
    },
    sellerActor(sellerId),
  );
}
