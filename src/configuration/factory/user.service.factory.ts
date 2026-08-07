import { UserService } from '../../domain/identity/service/user.service';
import { UserRepositoryRead } from '../../infraestructure/repository/identity/user.repository.read';
import { UserRepositoryWrite } from '../../infraestructure/repository/identity/user.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';

export class UserServiceFactory {
  static create() {
    return new UserService({
      userRepositoryRead: new UserRepositoryRead(),
      userRepositoryWrite: new UserRepositoryWrite(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
