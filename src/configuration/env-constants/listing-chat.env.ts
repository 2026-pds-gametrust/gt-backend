export const CHAT_SEND_RATE_LIMIT_PER_MINUTE =
  Number(process.env.CHAT_SEND_RATE_LIMIT_PER_MINUTE) || 30;

export const CHAT_OPEN_CONVERSATION_RATE_LIMIT_PER_HOUR =
  Number(process.env.CHAT_OPEN_CONVERSATION_RATE_LIMIT_PER_HOUR) || 10;

export const CHAT_REPORT_RATE_LIMIT_PER_DAY =
  Number(process.env.CHAT_REPORT_RATE_LIMIT_PER_DAY) || 20;

export const CHAT_SOCKET_IO_PATH =
  process.env.CHAT_SOCKET_IO_PATH || '/listing-chat/socket.io';
