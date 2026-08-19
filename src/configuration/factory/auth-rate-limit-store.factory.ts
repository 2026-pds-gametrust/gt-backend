import { MongoAuthRateLimitStore } from '../../infraestructure/rate-limit/mongo-auth-rate-limit.store';

export class AuthRateLimitStoreFactory {
  static create() {
    return new MongoAuthRateLimitStore();
  }
}
