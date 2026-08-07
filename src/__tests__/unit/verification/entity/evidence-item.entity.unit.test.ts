import { EvidenceItemServiceEntity } from '../../../../domain/verification/entity/evidence-item.entity';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { validEvidenceItemMock } from '../../../__mocks__/verification.mock';

describe('when constructing an evidence item entity', () => {
  it('should accept a valid evidence item and trim fields', () => {
    const entity = new EvidenceItemServiceEntity(
      validEvidenceItemMock({
        caseId: '  case-1  ',
        storageKey: '  private/key.jpg  ',
        contentHash: '  abc  ',
        type: EEvidenceType.PHOTO,
      }),
    );
    expect(entity.caseId).toBe('case-1');
    expect(entity.storageKey).toBe('private/key.jpg');
    expect(entity.contentHash).toBe('abc');
  });

  it('should reject missing id', () => {
    expect(
      () =>
        new EvidenceItemServiceEntity(validEvidenceItemMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing caseId', () => {
    expect(
      () =>
        new EvidenceItemServiceEntity(validEvidenceItemMock({ caseId: '' })),
    ).toThrow('caseId is required');
  });

  it('should reject missing type', () => {
    expect(
      () =>
        new EvidenceItemServiceEntity(
          validEvidenceItemMock({ type: undefined as any }),
        ),
    ).toThrow('type is required');
  });

  it('should reject missing storageKey', () => {
    expect(
      () =>
        new EvidenceItemServiceEntity(
          validEvidenceItemMock({ storageKey: '  ' }),
        ),
    ).toThrow('storageKey is required');
  });
});
