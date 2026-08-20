import { VerificationCaseServiceEntity } from '../../../../domain/verification/entity/verification-case.entity';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { validVerificationCaseMock } from '../../../__mocks__/verification.mock';

describe('when constructing a verification case entity', () => {
  it('should accept a valid verification case and trim listingId', () => {
    const entity = new VerificationCaseServiceEntity(
      validVerificationCaseMock({
        listingId: '  listing-1  ',
        status: EVerificationCaseStatus.PENDING,
        decisionReason: '  ok  ',
      }),
    );
    expect(entity.listingId).toBe('listing-1');
    expect(entity.decisionReason).toBe('ok');
  });

  it('should reject missing id', () => {
    expect(
      () =>
        new VerificationCaseServiceEntity(
          validVerificationCaseMock({ id: ' ' }),
        ),
    ).toThrow('id is required');
  });

  it('should reject missing listingId', () => {
    expect(
      () =>
        new VerificationCaseServiceEntity(
          validVerificationCaseMock({ listingId: '' }),
        ),
    ).toThrow('listingId is required');
  });

  it('should reject missing status', () => {
    expect(
      () =>
        new VerificationCaseServiceEntity(
          validVerificationCaseMock({ status: undefined as any }),
        ),
    ).toThrow('status is required');
  });
});
