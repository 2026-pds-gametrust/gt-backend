import { EUserGroup } from '@sauvvitech/st-packages';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';

describe('when we publish a submitted listing missing SHIPPING package weight via HTTP', () => {
  it('should return 400 FIELD_INVALID instead of OpenAPI 500', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({
      categoryId: category.id,
      referencePriceCents: undefined,
    });

    await supertest(app.app)
      .post('/products')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: 'backoffice-actor',
          groups: [EUserGroup.BACKOFFICE],
        })}`,
      )
      .send({
        id: product.id,
        categoryId: product.categoryId,
        brand: product.brand,
        model: product.model,
        slug: product.slug,
      });

    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
      shipping: {
        modes: [EShippingMode.SHIPPING],
        packageWeightGrams: 0,
        packageLengthCm: 10,
        packageWidthCm: 10,
        packageHeightCm: 10,
      },
    });

    const created = await supertest(app.app)
      .post('/listings')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: user.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      )
      .send({
        id: listing.id,
        sellerId: listing.sellerId,
        productId: listing.productId,
        title: listing.title,
        condition: listing.condition,
        priceCents: listing.priceCents,
        currency: listing.currency,
        media: listing.media,
        shipping: listing.shipping,
      });
    expect(created.statusCode).toBe(201);

    const submitted = await supertest(app.app)
      .post(`/listings/${listing.id}/submit`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: user.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      );
    expect(submitted.statusCode).toBe(200);

    const published = await supertest(app.app)
      .post(`/listings/${listing.id}/publish`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: 'backoffice-actor',
          groups: [EUserGroup.BACKOFFICE],
        })}`,
      );

    expect(published.statusCode).toBe(400);
    expect(published.body.code).toBe(EErrorCode.FIELD_INVALID);
    expect(published.body).not.toMatchObject({
      errors: expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            "no schema defined for status code '400'",
          ),
        }),
      ]),
    });
  });
});
