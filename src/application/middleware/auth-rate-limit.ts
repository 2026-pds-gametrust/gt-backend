import { rateLimit, Store } from 'express-rate-limit';

const AUTH_THROTTLE_MESSAGE = {
  message: 'Too many requests, please try again later.',
};

export function createAuthRateLimit(store: Store) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: false,
    store,
    message: AUTH_THROTTLE_MESSAGE,
  });
}
