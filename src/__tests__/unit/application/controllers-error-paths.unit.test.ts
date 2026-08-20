import { CatalogController } from '../../../application/controllers/catalog.controller';
import { IdentityController } from '../../../application/controllers/identity.controller';
import { ListingsController } from '../../../application/controllers/listings.controller';
import { TrustController } from '../../../application/controllers/trust.controller';
import { VerificationController } from '../../../application/controllers/verification.controller';
import { SearchController } from '../../../application/controllers/search.controller';
import { FavoritesController } from '../../../application/controllers/favorites.controller';

function mockRes() {
  const res: any = {
    statusCode: 200,
    body: undefined,
    locals: { language: 'en' },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send() {
      return this;
    },
  };
  return res;
}

const boom = { status: 500, errorCode: 'DATABASE_ERROR', message: 'boom' };

describe('when controllers translate service failures', () => {
  it('should handle catalog handler errors', async () => {
    const failing = {
      listCategories: jest.fn().mockRejectedValue(boom),
      getCategoryById: jest.fn().mockRejectedValue(boom),
      createCategory: jest.fn().mockRejectedValue(boom),
      updateCategoryById: jest.fn().mockRejectedValue(boom),
      listServices: jest.fn().mockRejectedValue(boom),
      getServiceById: jest.fn().mockRejectedValue(boom),
      createService: jest.fn().mockRejectedValue(boom),
      updateServiceById: jest.fn().mockRejectedValue(boom),
      listProducts: jest.fn().mockRejectedValue(boom),
      getProductById: jest.fn().mockRejectedValue(boom),
      createProduct: jest.fn().mockRejectedValue(boom),
      updateProductById: jest.fn().mockRejectedValue(boom),
    };
    const schema = {
      getByCategoryId: jest.fn().mockRejectedValue(boom),
      upsertByCategoryId: jest.fn().mockRejectedValue(boom),
    };
    const price = {
      listByProductId: jest.fn().mockRejectedValue(boom),
    };
    const controller = new CatalogController(
      failing as any,
      failing as any,
      schema as any,
      failing as any,
      price as any,
    );
    const res = mockRes();
    await controller.listCategories({} as any, res);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    await controller.getCategoryById({ params: { id: '1' } } as any, mockRes());
    await controller.createCategory({ body: {} } as any, mockRes());
    await controller.updateCategory({ params: { id: '1' }, body: {} } as any, mockRes());
    await controller.listServices({} as any, mockRes());
    await controller.getServiceById({ params: { id: '1' } } as any, mockRes());
    await controller.createService({ body: {} } as any, mockRes());
    await controller.updateService({ params: { id: '1' }, body: {} } as any, mockRes());
    await controller.listProducts({} as any, mockRes());
    await controller.getProductById({ params: { id: '1' } } as any, mockRes());
    await controller.createProduct({ body: {} } as any, mockRes());
    await controller.updateProduct({ params: { id: '1' }, body: {} } as any, mockRes());
    await controller.getAttributeSchema({ params: { categoryId: '1' } } as any, mockRes());
    await controller.upsertAttributeSchema({ params: { categoryId: '1' }, body: {} } as any, mockRes());
    await controller.getPriceHistory({ params: { productId: '1' } } as any, mockRes());
  });

  it('should handle identity handler errors', async () => {
    const user = {
      listUsers: jest.fn().mockRejectedValue(boom),
      getUserById: jest.fn().mockRejectedValue(boom),
      createUser: jest.fn().mockRejectedValue(boom),
      updateUserById: jest.fn().mockRejectedValue(boom),
      deleteUserById: jest.fn().mockRejectedValue(boom),
      verifyUser: jest.fn().mockRejectedValue(boom),
    };
    const profile = {
      listProfiles: jest.fn().mockRejectedValue(boom),
      getProfileById: jest.fn().mockRejectedValue(boom),
      getProfileByUserId: jest.fn().mockRejectedValue(boom),
      createProfile: jest.fn().mockRejectedValue(boom),
      updateProfileById: jest.fn().mockRejectedValue(boom),
      findProfilesNear: jest.fn().mockRejectedValue(boom),
    };
    const auth = {
      assignGroups: jest.fn().mockRejectedValue(boom),
    };
    const cep = {
      lookupByCep: jest.fn().mockRejectedValue(boom),
    };
    const controller = new IdentityController(
      user as any,
      profile as any,
      auth as any,
      cep as any,
    );
    await controller.getUsers({} as any, mockRes());
    await controller.getUserById({ params: { id: '1' } } as any, mockRes());
    await controller.createUser({ body: {} } as any, mockRes());
    await controller.updateUser({ params: { id: '1' }, body: {} } as any, mockRes());
    await controller.deleteUser({ params: { id: '1' } } as any, mockRes());
    await controller.verifyUser({ params: { id: '1' } } as any, mockRes());
    await controller.listProfiles({} as any, mockRes());
    await controller.getProfileById({ params: { id: '1' } } as any, mockRes());
    await controller.getProfileByUserId({ params: { userId: '1' } } as any, mockRes());
    await controller.createProfile({ body: {}, actor: { actorId: '1', groups: [] } } as any, mockRes());
    await controller.updateProfile({ params: { id: '1' }, body: {}, actor: { actorId: '1', groups: [] } } as any, mockRes());
    await controller.findProfilesNear({ query: { lng: 0, lat: 0 } } as any, mockRes());
    await controller.lookupCep({ params: { cep: '01310100' } } as any, mockRes());
    await controller.assignUserGroups(
      { params: { id: '1' }, body: { groups: [] }, actor: { actorId: '1', groups: [] } } as any,
      mockRes(),
    );
  });

  it('should handle listings trust verification search and favorites errors', async () => {
    const listing = {
      listListings: jest.fn().mockRejectedValue(boom),
      getListingById: jest.fn().mockRejectedValue(boom),
      createListing: jest.fn().mockRejectedValue(boom),
      updateListingById: jest.fn().mockRejectedValue(boom),
      submitListing: jest.fn().mockRejectedValue(boom),
      publishListing: jest.fn().mockRejectedValue(boom),
      pauseListing: jest.fn().mockRejectedValue(boom),
      listEvents: jest.fn().mockRejectedValue(boom),
    };
    const listingsController = new ListingsController(listing as any);
    await listingsController.listListings({} as any, mockRes());
    await listingsController.getListingById({ params: { id: '1' } } as any, mockRes());
    await listingsController.createListing({ body: {}, actor: { actorId: '1', groups: [] } } as any, mockRes());
    await listingsController.updateListing({ params: { id: '1' }, body: {}, actor: { actorId: '1', groups: [] } } as any, mockRes());
    await listingsController.submitListing({ params: { id: '1' }, actor: { actorId: '1', groups: [] } } as any, mockRes());
    await listingsController.publishListing({ params: { id: '1' }, actor: { actorId: '1', groups: [] } } as any, mockRes());
    await listingsController.pauseListing({ params: { id: '1' }, actor: { actorId: '1', groups: [] } } as any, mockRes());
    await listingsController.listListingEvents({ params: { id: '1' } } as any, mockRes());

    const trust = {
      listBySellerId: jest.fn().mockRejectedValue(boom),
      appendTrustEvent: jest.fn().mockRejectedValue(boom),
    };
    const score = {
      getTrustScoreBySellerId: jest.fn().mockRejectedValue(boom),
      recomputeForSeller: jest.fn().mockRejectedValue(boom),
    };
    const level = {
      getSellerLevelBySellerId: jest.fn().mockRejectedValue(boom),
    };
    const trustController = new TrustController(trust as any, score as any, level as any);
    await trustController.listTrustEvents({ query: { sellerId: 's' } } as any, mockRes());
    await trustController.listTrustEvents({ query: {} } as any, mockRes());
    await trustController.appendTrustEvent({ body: {} } as any, mockRes());
    await trustController.getTrustScoreBySellerId({ params: { sellerId: 's' } } as any, mockRes());
    await trustController.recomputeTrustScore({ params: { sellerId: 's' } } as any, mockRes());
    await trustController.getSellerLevelBySellerId({ params: { sellerId: 's' } } as any, mockRes());

    const cases = {
      listVerificationCases: jest.fn().mockRejectedValue(boom),
      getVerificationCaseById: jest.fn().mockRejectedValue(boom),
      getProofCodePlaintext: jest.fn().mockRejectedValue(boom),
      openCase: jest.fn().mockRejectedValue(boom),
      assignReviewer: jest.fn().mockRejectedValue(boom),
      approveCase: jest.fn().mockRejectedValue(boom),
      rejectCase: jest.fn().mockRejectedValue(boom),
    };
    const evidence = {
      listByCaseId: jest.fn().mockRejectedValue(boom),
      addEvidence: jest.fn().mockRejectedValue(boom),
    };
    const seals = {
      listSealsByListingId: jest.fn().mockRejectedValue(boom),
      getSealById: jest.fn().mockRejectedValue(boom),
      revokeSeal: jest.fn().mockRejectedValue(boom),
    };
    const verification = new VerificationController(
      cases as any,
      evidence as any,
      seals as any,
      { getAnalysisForCase: async () => ({}), requestAnalysis: async () => null } as any,
    );
    await verification.listVerificationCases({} as any, mockRes());
    await verification.getVerificationCaseById({ params: { id: '1' } } as any, mockRes());
    await verification.getProofCode({ params: { id: '1' }, actor: { actorId: 'u' } } as any, mockRes());
    await verification.openVerificationCase({ body: {} } as any, mockRes());
    await verification.assignReviewer({ params: { id: '1' }, body: {} } as any, mockRes());
    await verification.approveCase({ params: { id: '1' } } as any, mockRes());
    await verification.rejectCase({ params: { id: '1' }, body: {} } as any, mockRes());
    await verification.listEvidence({ params: { caseId: '1' } } as any, mockRes());
    await verification.addEvidence({ params: { caseId: '1' }, body: {} } as any, mockRes());
    await verification.listSeals({ query: { listingId: '1' } } as any, mockRes());
    await verification.listSeals({ query: {} } as any, mockRes());
    await verification.getSealById({ params: { id: '1' } } as any, mockRes());
    await verification.revokeSeal({ params: { id: '1' }, body: {} } as any, mockRes());

    const search = {
      search: jest.fn().mockRejectedValue(boom),
    };
    const synonym = {
      listSynonyms: jest.fn().mockRejectedValue(boom),
    };
    const reconcile = {
      reconcile: jest.fn().mockRejectedValue(boom),
    };
    const searchController = new SearchController(search as any, synonym as any, reconcile as any);
    await searchController.search({ query: {} } as any, mockRes());
    await searchController.listSynonyms({ query: {} } as any, mockRes());
    await searchController.reconcile({} as any, mockRes());

    const favorite = {
      listByUserId: jest.fn().mockRejectedValue(boom),
      createFavorite: jest.fn().mockRejectedValue(boom),
      deleteFavoriteById: jest.fn().mockRejectedValue(boom),
    };
    const favoritesController = new FavoritesController(favorite as any);
    await favoritesController.listFavorites({ query: { userId: 'u' }, actor: { actorId: 'u', groups: [] } } as any, mockRes());
    await favoritesController.createFavorite({ body: {}, actor: { actorId: 'u', groups: [] } } as any, mockRes());
    await favoritesController.deleteFavorite({ params: { id: '1' }, actor: { actorId: 'u', groups: [] } } as any, mockRes());
  });
});
