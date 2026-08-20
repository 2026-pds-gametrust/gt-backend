import { MediaAssetServiceEntity } from '../../../../domain/media/entity/media-asset.entity';
import { EMediaPurpose } from '../../../../domain/media/entity/enums/EMediaPurpose';
import { validMediaAssetMock } from '../../../__mocks__/media.mock';

describe('when constructing a media asset entity', () => {
  it('should accept a valid asset and normalize contentType', () => {
    const entity = new MediaAssetServiceEntity(
      validMediaAssetMock({ contentType: 'IMAGE/JPEG' }),
    );
    expect(entity.contentType).toBe('image/jpeg');
    expect(entity.purpose).toBe(EMediaPurpose.LISTING);
  });

  it('should accept byteSize at the 10 MiB limit', () => {
    const entity = new MediaAssetServiceEntity(
      validMediaAssetMock({ byteSize: 10 * 1024 * 1024 }),
    );
    expect(entity.byteSize).toBe(10 * 1024 * 1024);
  });

  it('should reject byteSize just above the 10 MiB limit', () => {
    expect(
      () =>
        new MediaAssetServiceEntity(
          validMediaAssetMock({ byteSize: 10 * 1024 * 1024 + 1 }),
        ),
    ).toThrow('byteSize exceeds maximum');
  });

  it('should accept byteSize at the 50 MiB video limit', () => {
    const entity = new MediaAssetServiceEntity(
      validMediaAssetMock({
        contentType: 'video/mp4',
        byteSize: 50 * 1024 * 1024,
      }),
    );
    expect(entity.byteSize).toBe(50 * 1024 * 1024);
  });

  it('should reject video byteSize just above the 50 MiB limit', () => {
    expect(
      () =>
        new MediaAssetServiceEntity(
          validMediaAssetMock({
            contentType: 'video/mp4',
            byteSize: 50 * 1024 * 1024 + 1,
          }),
        ),
    ).toThrow('byteSize exceeds maximum');
  });

  it('should reject missing ownerId', () => {
    expect(
      () =>
        new MediaAssetServiceEntity(validMediaAssetMock({ ownerId: '  ' })),
    ).toThrow('ownerId is required');
  });

  it('should reject unsupported contentType', () => {
    expect(
      () =>
        new MediaAssetServiceEntity(
          validMediaAssetMock({ contentType: 'application/pdf' }),
        ),
    ).toThrow('contentType is invalid');
  });
});
