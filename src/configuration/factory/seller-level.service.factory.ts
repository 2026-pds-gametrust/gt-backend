import { SellerLevelService } from '../../domain/trust/service/seller-level.service';
import { SellerLevelRepositoryRead } from '../../infraestructure/repository/trust/seller-level.repository.read';
import { SellerLevelRepositoryWrite } from '../../infraestructure/repository/trust/seller-level.repository.write';

export class SellerLevelServiceFactory {
  static create() {
    return new SellerLevelService({
      sellerLevelRepositoryRead: new SellerLevelRepositoryRead(),
      sellerLevelRepositoryWrite: new SellerLevelRepositoryWrite(),
    });
  }
}
