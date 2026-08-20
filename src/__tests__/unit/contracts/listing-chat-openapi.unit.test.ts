import fs from 'fs';
import path from 'path';

const yaml = fs.readFileSync(
  path.join(__dirname, '../../../contracts/service.yaml'),
  'utf8',
);

function schemaBlock(name: string): string {
  const start = yaml.indexOf(`    ${name}:`);
  expect(start).toBeGreaterThan(-1);
  const rest = yaml.slice(start);
  const next = rest.search(/\n {4}[A-Z][A-Za-z0-9]+:/);
  return next === -1 ? rest : rest.slice(0, next);
}

describe('when inspecting the published OpenAPI ListingChat contract', () => {
  it('should declare ListingChat tag and conversation routes with bearer auth', () => {
    expect(yaml).toContain('- name: ListingChat');
    expect(yaml).toMatch(/\/conversations:[\s\S]*?tags:[\s\S]*?- ListingChat/);
    expect(yaml).toMatch(/\/conversations\/\{conversationId\}:[\s\S]*?- ListingChat/);
    expect(yaml).toMatch(/\/conversations\/\{conversationId\}\/messages:[\s\S]*?- ListingChat/);
    expect(yaml).toMatch(/\/chat-reports:[\s\S]*?- ListingChat/);
    expect(yaml).toMatch(/\/conversations:[\s\S]*?'401':/);
    expect(yaml).toMatch(/\/conversations\/\{conversationId\}\/messages:[\s\S]*?'404':/);
    expect(yaml).toMatch(/\/conversations\/\{conversationId\}\/messages:[\s\S]*?'409':/);
    expect(yaml).toMatch(/\/conversations\/\{conversationId\}\/messages:[\s\S]*?'422':/);
    expect(yaml).toMatch(/\/conversations\/\{conversationId\}\/messages:[\s\S]*?'429':/);
    expect(yaml).toMatch(/\/chat-reports:[\s\S]*?'403':/);
  });

  it('should define ListingChat schemas and status enums', () => {
    for (const name of [
      'NewConversation',
      'Conversation',
      'ConversationSummary',
      'ConversationPage',
      'NewMessage',
      'Message',
      'MessagePage',
      'NewChatReport',
      'ChatReport',
      'ChatReportPage',
      'EConversationStatus',
      'EMessageStatus',
      'EChatReportTargetType',
    ]) {
      expect(schemaBlock(name).length).toBeGreaterThan(0);
    }
  });

  it('should document ListingChat Socket.IO realtime extension', () => {
    expect(yaml).toMatch(
      /name: ListingChat[\s\S]*?x-realtime:[\s\S]*?transport: socket\.io/,
    );
    expect(yaml).toMatch(
      /x-realtime:[\s\S]*?path: \/listing-chat\/socket\.io/,
    );
    expect(yaml).toMatch(/x-realtime:[\s\S]*?pathEnv: CHAT_SOCKET_IO_PATH/);
    expect(yaml).toMatch(/x-realtime:[\s\S]*?conversation:join:/);
    expect(yaml).toMatch(/x-realtime:[\s\S]*?conversation:leave:/);
    expect(yaml).toMatch(/x-realtime:[\s\S]*?message\.created:/);
    expect(yaml).toMatch(
      /x-realtime:[\s\S]*?\$ref: '#\/components\/schemas\/Message'/,
    );
  });
});
