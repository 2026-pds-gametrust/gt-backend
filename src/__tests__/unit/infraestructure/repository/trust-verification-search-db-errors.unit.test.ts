import { TrustEventModel } from '../../../../infraestructure/db/mongo/models/trust-event.model';
import { TrustScoreModel } from '../../../../infraestructure/db/mongo/models/trust-score.model';
import { SellerLevelModel } from '../../../../infraestructure/db/mongo/models/seller-level.model';
import { VerificationCaseModel } from '../../../../infraestructure/db/mongo/models/verification-case.model';
import { EvidenceItemModel } from '../../../../infraestructure/db/mongo/models/evidence-item.model';
import { SealModel } from '../../../../infraestructure/db/mongo/models/seal.model';
import { SynonymModel } from '../../../../infraestructure/db/mongo/models/synonym.model';
import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { TrustEventRepositoryRead } from '../../../../infraestructure/repository/trust/trust-event.repository.read';
import { TrustEventRepositoryWrite } from '../../../../infraestructure/repository/trust/trust-event.repository.write';
import { TrustScoreRepositoryRead } from '../../../../infraestructure/repository/trust/trust-score.repository.read';
import { TrustScoreRepositoryWrite } from '../../../../infraestructure/repository/trust/trust-score.repository.write';
import { SellerLevelRepositoryRead } from '../../../../infraestructure/repository/trust/seller-level.repository.read';
import { SellerLevelRepositoryWrite } from '../../../../infraestructure/repository/trust/seller-level.repository.write';
import { VerificationCaseRepositoryRead } from '../../../../infraestructure/repository/verification/verification-case.repository.read';
import { VerificationCaseRepositoryWrite } from '../../../../infraestructure/repository/verification/verification-case.repository.write';
import { EvidenceItemRepositoryRead } from '../../../../infraestructure/repository/verification/evidence-item.repository.read';
import { EvidenceItemRepositoryWrite } from '../../../../infraestructure/repository/verification/evidence-item.repository.write';
import { SealRepositoryRead } from '../../../../infraestructure/repository/verification/seal.repository.read';
import { SealRepositoryWrite } from '../../../../infraestructure/repository/verification/seal.repository.write';
import { SynonymRepositoryRead } from '../../../../infraestructure/repository/search/synonym.repository.read';
import { SynonymRepositoryWrite } from '../../../../infraestructure/repository/search/synonym.repository.write';
import { SearchDocumentRepositoryRead } from '../../../../infraestructure/repository/search/search-document.repository.read';
import { SearchDocumentRepositoryWrite } from '../../../../infraestructure/repository/search/search-document.repository.write';
import { UserRepositoryWrite } from '../../../../infraestructure/repository/identity/user.repository.write';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';

const trustEventRead = new TrustEventRepositoryRead();
const trustEventWrite = new TrustEventRepositoryWrite();
const trustScoreRead = new TrustScoreRepositoryRead();
const trustScoreWrite = new TrustScoreRepositoryWrite();
const sellerLevelRead = new SellerLevelRepositoryRead();
const sellerLevelWrite = new SellerLevelRepositoryWrite();
const caseRead = new VerificationCaseRepositoryRead();
const caseWrite = new VerificationCaseRepositoryWrite();
const evidenceRead = new EvidenceItemRepositoryRead();
const evidenceWrite = new EvidenceItemRepositoryWrite();
const sealRead = new SealRepositoryRead();
const sealWrite = new SealRepositoryWrite();
const synonymRead = new SynonymRepositoryRead();
const synonymWrite = new SynonymRepositoryWrite();
const searchDocRead = new SearchDocumentRepositoryRead();
const searchDocWrite = new SearchDocumentRepositoryWrite();
const userWrite = new UserRepositoryWrite();

describe('when repositories hit database failures', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should throw DATABASE_ERROR on trustEventRead.findTrustEventById', async () => {
    jest.spyOn(TrustEventModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(trustEventRead.findTrustEventById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on trustEventRead.findBySourceEventId', async () => {
    jest.spyOn(TrustEventModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(trustEventRead.findBySourceEventId(...['src'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on trustEventRead.listBySellerId', async () => {
    jest.spyOn(TrustEventModel, 'find').mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('boom')) } as any);
    await expect(trustEventRead.listBySellerId(...['s'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on trustEventWrite.appendTrustEvent', async () => {
    jest.spyOn(TrustEventModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(trustEventWrite.appendTrustEvent(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on trustScoreRead.findTrustScoreBySellerId', async () => {
    jest.spyOn(TrustScoreModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(trustScoreRead.findTrustScoreBySellerId(...['s'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on trustScoreRead.findTrustScoreById', async () => {
    jest.spyOn(TrustScoreModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(trustScoreRead.findTrustScoreById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on trustScoreWrite.createTrustScore', async () => {
    jest.spyOn(TrustScoreModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(trustScoreWrite.createTrustScore(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on trustScoreWrite.updateTrustScoreBySellerId', async () => {
    jest.spyOn(TrustScoreModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(trustScoreWrite.updateTrustScoreBySellerId(...['s',{ score:1 }])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on trustScoreWrite.upsertTrustScore', async () => {
    jest.spyOn(TrustScoreModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(trustScoreWrite.upsertTrustScore(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on sellerLevelRead.findSellerLevelBySellerId', async () => {
    jest.spyOn(SellerLevelModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(sellerLevelRead.findSellerLevelBySellerId(...['s'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on sellerLevelWrite.upsertSellerLevel', async () => {
    jest.spyOn(SellerLevelModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(sellerLevelWrite.upsertSellerLevel(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on caseRead.findVerificationCaseById', async () => {
    jest.spyOn(VerificationCaseModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(caseRead.findVerificationCaseById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on caseRead.findOpenCaseByListingId', async () => {
    jest.spyOn(VerificationCaseModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(caseRead.findOpenCaseByListingId(...['l'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on caseRead.listVerificationCases', async () => {
    jest.spyOn(VerificationCaseModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(caseRead.listVerificationCases(...[])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on caseWrite.createVerificationCase', async () => {
    jest.spyOn(VerificationCaseModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(caseWrite.createVerificationCase(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on caseWrite.updateVerificationCaseById', async () => {
    jest.spyOn(VerificationCaseModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(caseWrite.updateVerificationCaseById(...['id',{ status:'APPROVED' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on evidenceRead.findEvidenceItemById', async () => {
    jest.spyOn(EvidenceItemModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(evidenceRead.findEvidenceItemById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on evidenceRead.listByCaseId', async () => {
    jest.spyOn(EvidenceItemModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(evidenceRead.listByCaseId(...['c'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on evidenceWrite.createEvidenceItem', async () => {
    jest.spyOn(EvidenceItemModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(evidenceWrite.createEvidenceItem(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on sealRead.findSealById', async () => {
    jest.spyOn(SealModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(sealRead.findSealById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on sealRead.findActiveSealByListingId', async () => {
    jest.spyOn(SealModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(sealRead.findActiveSealByListingId(...['l'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on sealRead.listSealsByListingId', async () => {
    jest.spyOn(SealModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(sealRead.listSealsByListingId(...['l'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on sealWrite.createSeal', async () => {
    jest.spyOn(SealModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(sealWrite.createSeal(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on sealWrite.updateSealById', async () => {
    jest.spyOn(SealModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(sealWrite.updateSealById(...['id',{ status: ESealStatus.REVOKED }])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on synonymRead.findByNormalizedTerm', async () => {
    jest.spyOn(SynonymModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(synonymRead.findByNormalizedTerm(...['t'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on synonymRead.findById', async () => {
    jest.spyOn(SynonymModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(synonymRead.findById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on synonymRead.listByQuery', async () => {
    jest.spyOn(SynonymModel, 'find').mockReturnValue({ limit: jest.fn().mockRejectedValue(new Error('boom')) } as any);
    await expect(synonymRead.listByQuery(...['q'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on synonymWrite.upsertSynonym', async () => {
    jest.spyOn(SynonymModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(synonymWrite.upsertSynonym(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on searchDocRead.findByListingId', async () => {
    jest.spyOn(SearchDocumentModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(searchDocRead.findByListingId(...['l'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on searchDocRead.findById', async () => {
    jest.spyOn(SearchDocumentModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(searchDocRead.findById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on searchDocWrite.upsertSearchDocument', async () => {
    jest.spyOn(SearchDocumentModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(searchDocWrite.upsertSearchDocument(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on searchDocWrite.deleteByListingId', async () => {
    jest.spyOn(SearchDocumentModel, 'deleteOne').mockRejectedValueOnce(new Error('boom'));
    await expect(searchDocWrite.deleteByListingId(...['l'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on searchDocRead.search', async () => {
    jest.spyOn(SearchDocumentModel, 'find').mockReturnValue({
      limit: jest.fn().mockRejectedValue(new Error('boom')),
    } as any);
    await expect(searchDocRead.search({ q: 'gpu' })).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on userWrite.createUser', async () => {
    jest.spyOn(UserModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(userWrite.createUser(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on userWrite.updateUserById', async () => {
    jest.spyOn(UserModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(userWrite.updateUserById(...['id',{ fullName:'x' }])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on userWrite.deleteUserById', async () => {
    jest.spyOn(UserModel, 'findOneAndDelete').mockRejectedValueOnce(new Error('boom'));
    await expect(userWrite.deleteUserById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

});
