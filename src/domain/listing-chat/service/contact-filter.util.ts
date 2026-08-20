export const CONTACT_REMOVED_TOKEN = '[contato removido]';
export const LINK_REMOVED_TOKEN = '[link removido]';

export type TContactFilterOutcome = 'ACCEPT' | 'REJECT';

export interface IContactFilterResult {
  outcome: TContactFilterOutcome;
  maskedBody: string;
}

const EMAIL_REGEX =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;

const PHONE_REGEX =
  /(?<!\d)(?:(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}|\+?\d{10,13})(?!\d)/g;

const KNOWN_TLDS =
  'com|br|net|org|io|me|app|shop|store|dev|info|co|xyz|online|site|link|tech|games|gg|tv|us|uk|eu|pt|es|de|fr|it|ca|au|nz|jp|cn|in|mx|ar|cl|pe|co\\.uk|com\\.br';

const URL_REGEX = new RegExp(
  [
    '(?:https?:\\/\\/|www\\.)[^\\s]+',
    '\\b(?:whatsapp|t\\.me):\\/\\/[^\\s]+',
    '\\bwa\\.me\\/[^\\s]+',
    '\\bt\\.me\\/[^\\s]+',
    `\\b[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\\.(?:${KNOWN_TLDS})(?:\\/[^\\s]*)?\\b`,
  ].join('|'),
  'gi',
);

export function applyContactFilter(rawBody: string): IContactFilterResult {
  let masked = rawBody;

  masked = masked.replace(EMAIL_REGEX, CONTACT_REMOVED_TOKEN);
  masked = masked.replace(URL_REGEX, LINK_REMOVED_TOKEN);
  masked = masked.replace(PHONE_REGEX, CONTACT_REMOVED_TOKEN);

  const usefulRemainder = masked
    .split(CONTACT_REMOVED_TOKEN)
    .join('')
    .split(LINK_REMOVED_TOKEN)
    .join('')
    .trim();

  if (usefulRemainder.length === 0) {
    return { outcome: 'REJECT', maskedBody: masked.trim() };
  }

  return { outcome: 'ACCEPT', maskedBody: masked.trim() };
}
