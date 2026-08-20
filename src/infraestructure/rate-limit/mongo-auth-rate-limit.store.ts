import type {
  ClientRateLimitInfo,
  IncrementResponse,
  Options,
  Store,
} from 'express-rate-limit';
import { AuthRateLimitModel } from '../db/mongo/models/auth-rate-limit.model';

const DUPLICATE_KEY = 11000;

export class MongoAuthRateLimitStore implements Store {
  windowMs = 15 * 60 * 1000;
  localKeys = false;

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const doc = await AuthRateLimitModel.findOne({
      key,
      resetAt: { $gt: new Date() },
    });
    if (!doc) {
      return undefined;
    }
    return { totalHits: doc.hits, resetTime: doc.resetAt };
  }

  async increment(key: string): Promise<IncrementResponse> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + this.windowMs);

    const incremented = await AuthRateLimitModel.findOneAndUpdate(
      { key, resetAt: { $gt: now } },
      { $inc: { hits: 1 } },
      { new: true },
    );
    if (incremented) {
      return { totalHits: incremented.hits, resetTime: incremented.resetAt };
    }

    try {
      const created = await AuthRateLimitModel.findOneAndUpdate(
        { key },
        { $set: { hits: 1, resetAt } },
        { upsert: true, new: true },
      );
      return { totalHits: created!.hits, resetTime: created!.resetAt };
    } catch (error: unknown) {
      if ((error as { code?: number }).code !== DUPLICATE_KEY) {
        throw error;
      }
      const retried = await AuthRateLimitModel.findOneAndUpdate(
        { key, resetAt: { $gt: now } },
        { $inc: { hits: 1 } },
        { new: true },
      );
      if (!retried) {
        throw error;
      }
      return { totalHits: retried.hits, resetTime: retried.resetAt };
    }
  }

  async decrement(key: string): Promise<void> {
    await AuthRateLimitModel.findOneAndUpdate(
      { key, hits: { $gt: 0 } },
      { $inc: { hits: -1 } },
    );
  }

  async resetKey(key: string): Promise<void> {
    await AuthRateLimitModel.deleteOne({ key });
  }
}
