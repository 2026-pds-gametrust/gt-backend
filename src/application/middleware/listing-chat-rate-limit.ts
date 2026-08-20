import { rateLimit } from 'express-rate-limit';
import {
  CHAT_OPEN_CONVERSATION_RATE_LIMIT_PER_HOUR,
  CHAT_REPORT_RATE_LIMIT_PER_DAY,
  CHAT_SEND_RATE_LIMIT_PER_MINUTE,
} from '../../configuration/env-constants/listing-chat.env';

const CHAT_THROTTLE_MESSAGE = {
  message: 'Too many chat requests, please try again later.',
};

function actorKey(req: { actor?: { actorId?: string } }): string {
  return req.actor?.actorId?.trim() || 'anonymous';
}

export const chatSendRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: CHAT_SEND_RATE_LIMIT_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: actorKey,
  message: CHAT_THROTTLE_MESSAGE,
});

export const chatOpenConversationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: CHAT_OPEN_CONVERSATION_RATE_LIMIT_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: actorKey,
  message: CHAT_THROTTLE_MESSAGE,
});

export const chatReportRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: CHAT_REPORT_RATE_LIMIT_PER_DAY,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: actorKey,
  message: CHAT_THROTTLE_MESSAGE,
});
