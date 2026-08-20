import { SealServiceEntity } from '../../../../domain/verification/entity/seal.entity';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';
import { validSealMock } from '../../../__mocks__/verification.mock';

describe('when constructing a seal entity', () => {
  it('should accept a valid seal and trim ids', () => {
    const entity = new SealServiceEntity(
      validSealMock({
        listingId: '  listing-1  ',
        caseId: '  case-1  ',
        type: ESealType.POSSESSION,
        status: ESealStatus.GRANTED,
      }),
    );
    expect(entity.listingId).toBe('listing-1');
    expect(entity.caseId).toBe('case-1');
  });

  it('should reject missing id', () => {
    expect(() => new SealServiceEntity(validSealMock({ id: ' ' }))).toThrow(
      'id is required',
    );
  });

  it('should reject missing listingId', () => {
    expect(
      () => new SealServiceEntity(validSealMock({ listingId: '' })),
    ).toThrow('listingId is required');
  });

  it('should reject missing caseId', () => {
    expect(
      () => new SealServiceEntity(validSealMock({ caseId: ' ' })),
    ).toThrow('caseId is required');
  });

  it('should reject missing type', () => {
    expect(
      () =>
        new SealServiceEntity(validSealMock({ type: undefined as any })),
    ).toThrow('type is required');
  });

  it('should reject missing status', () => {
    expect(
      () =>
        new SealServiceEntity(validSealMock({ status: undefined as any })),
    ).toThrow('status is required');
  });
});
