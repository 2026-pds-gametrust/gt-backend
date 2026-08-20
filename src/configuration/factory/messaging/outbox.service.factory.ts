import { OutboxService } from '../../../domain/common/messaging/outbox/outbox.service';
import { OutboxRepositoryWrite } from '../../../infraestructure/messaging/outbox/outbox.repository.write';

export class OutboxServiceFactory {
  private static instance: OutboxService | null = null;

  static create(): OutboxService {
    if (!this.instance) {
      this.instance = new OutboxService({
        outboxRepositoryWrite: new OutboxRepositoryWrite(),
      });
    }
    return this.instance;
  }

  static resetForTests(): void {
    this.instance = null;
  }
}
