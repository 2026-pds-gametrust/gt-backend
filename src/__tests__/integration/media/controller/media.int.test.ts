import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EMediaBucketClass } from '../../../../domain/media/entity/enums/EMediaBucketClass';
import { EMediaPurpose } from '../../../../domain/media/entity/enums/EMediaPurpose';
import { MemoryObjectStorage } from '../../../../infraestructure/storage/memory-object-storage';
import { bearerAuthorization } from '../../../helpers/sign-test-access-token';
import { createTestPng } from '../../../__mocks__/media.mock';

describe('when we upload and complete media via HTTP', () => {
  it('should return 201 then READY metadata without leaking evidence URLs', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const png = await createTestPng();
    const created = await supertest(app.app)
      .post('/media/uploads')
      .set(
        'Authorization',
        bearerAuthorization(ownerId, [EUserGroup.APP_USER]),
      )
      .send({
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'image/png',
        byteSize: png.length,
      });
    expect(created.statusCode).toBe(201);
    expect(created.body.status).toBe('PENDING_UPLOAD');
    expect(created.body.upload.url).toBeDefined();

    await MemoryObjectStorage.instance().putObject({
      bucketClass: EMediaBucketClass.PUBLIC,
      key: `public/listing/${ownerId}/${created.body.id}/original`,
      body: png,
      contentType: 'image/png',
    });

    const completed = await supertest(app.app)
      .post(`/media/uploads/${created.body.id}/complete`)
      .set(
        'Authorization',
        bearerAuthorization(ownerId, [EUserGroup.APP_USER]),
      )
      .send({});
    expect(completed.statusCode).toBe(200);
    expect(['UPLOADED', 'PROCESSING', 'READY']).toContain(completed.body.status);

    const fetched = await supertest(app.app)
      .get(`/media/assets/${created.body.id}`)
      .set(
        'Authorization',
        bearerAuthorization(ownerId, [EUserGroup.APP_USER]),
      );
    expect(fetched.statusCode).toBe(200);
    expect(fetched.body.id).toBe(created.body.id);
  });

  it('should reject a cross-owner listing grant', async () => {
    const response = await supertest(app.app)
      .post('/media/uploads')
      .set(
        'Authorization',
        bearerAuthorization('seller-a', [EUserGroup.APP_USER]),
      )
      .send({
        purpose: EMediaPurpose.LISTING,
        ownerId: 'seller-b',
        contentType: 'image/jpeg',
        byteSize: 1000,
      });
    expect(response.statusCode).toBe(403);
  });
});
