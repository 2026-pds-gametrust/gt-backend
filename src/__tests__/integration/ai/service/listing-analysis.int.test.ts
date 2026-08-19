import { randomUUID } from 'crypto';
import { ListingAnalysisService } from '../../../../domain/ai/service/listing-analysis.service';
import { EAnalysisChecklistItemStatus } from '../../../../domain/ai/entity/enums/EAnalysisChecklistItemStatus';
import { EListingAnalysisScope } from '../../../../domain/ai/entity/enums/EListingAnalysisScope';
import { EListingAnalysisStatus } from '../../../../domain/ai/entity/enums/EListingAnalysisStatus';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { ListingAnalysisRepositoryRead } from '../../../../infraestructure/repository/ai/listing-analysis.repository.read';
import { ListingAnalysisRepositoryWrite } from '../../../../infraestructure/repository/ai/listing-analysis.repository.write';
import { ListingAnalysisModel } from '../../../../infraestructure/db/mongo/models/listing-analysis.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { VerificationCaseModel } from '../../../../infraestructure/db/mongo/models/verification-case.model';
import { ListingRepositoryRead } from '../../../../infraestructure/repository/listings/listing.repository.read';
import { ListingRepositoryWrite } from '../../../../infraestructure/repository/listings/listing.repository.write';
import { VerificationCaseRepositoryRead } from '../../../../infraestructure/repository/verification/verification-case.repository.read';
import { VerificationCaseRepositoryWrite } from '../../../../infraestructure/repository/verification/verification-case.repository.write';
import { validListingMock } from '../../../__mocks__/listing.mock';

function buildAnalysisService() {
  return new ListingAnalysisService({
    listingAnalysisRepositoryRead: new ListingAnalysisRepositoryRead(),
    listingAnalysisRepositoryWrite: new ListingAnalysisRepositoryWrite(),
    listingRepositoryRead: new ListingRepositoryRead(),
    listingRepositoryWrite: new ListingRepositoryWrite(),
    mediaAssetRepositoryRead: {
      findMediaAssetById: async () => null,
    },
    objectStorage: { getObject: async () => null } as never,
    verificationCaseRepositoryRead: new VerificationCaseRepositoryRead(),
    verificationCaseRepositoryWrite: new VerificationCaseRepositoryWrite(),
    analysisProvider: { analyze: async () => ({ items: [], modelId: 'm' }) },
    eventPublisher: { publish: async () => undefined },
    analysisEnabled: false,
    maxPhotosToAnalyze: 4,
    maxVideoBytes: 1024,
  });
}

describe('when listing analysis completes for submit scope', () => {
  it('should populate verification case checklist aiAnalysis', async () => {
    const listing = validListingMock({ status: EListingStatus.SUBMITTED });
    await ListingModel.create(listing);

    const verificationCaseId = randomUUID();
    await VerificationCaseModel.create({
      id: verificationCaseId,
      listingId: listing.id,
      status: EVerificationCaseStatus.PENDING,
      createdAt: new Date(),
    });

    const analysisId = randomUUID();
    await ListingAnalysisModel.create({
      id: analysisId,
      listingId: listing.id,
      scope: EListingAnalysisScope.SUBMIT,
      status: EListingAnalysisStatus.COMPLETED,
      score: 75,
      items: [
        {
          id: 'photo-front-visible',
          status: EAnalysisChecklistItemStatus.PASS,
          weight: 15,
          reason: 'OK',
        },
      ],
      promptVersion: 'v1',
      idempotencyKey: randomUUID(),
      createdAt: new Date(),
    });

    const service = buildAnalysisService();
    await service.applyAnalysisToVerificationCase(listing.id, analysisId);

    const updated = await VerificationCaseModel.findOne({ id: verificationCaseId });
    expect(updated?.checklist?.aiAnalysis).toMatchObject({
      analysisId,
      score: 75,
    });
  });
});
