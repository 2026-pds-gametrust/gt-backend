import {
  applyContactFilter,
  CONTACT_REMOVED_TOKEN,
  LINK_REMOVED_TOKEN,
} from '../../../../domain/listing-chat/service/contact-filter.util';

describe('when applyContactFilter receives useful text with contact', () => {
  it('should ACCEPT and mask email', () => {
    const result = applyContactFilter('Olá, meu email é test@example.com ok?');
    expect(result.outcome).toBe('ACCEPT');
    expect(result.maskedBody).toContain(CONTACT_REMOVED_TOKEN);
    expect(result.maskedBody).toContain('Olá');
  });

  it('should ACCEPT and mask phone', () => {
    const result = applyContactFilter('Ligo no (11) 98765-4321 depois');
    expect(result.outcome).toBe('ACCEPT');
    expect(result.maskedBody).toContain(CONTACT_REMOVED_TOKEN);
    expect(result.maskedBody).toContain('Ligo');
  });

  it('should ACCEPT and mask URL', () => {
    const result = applyContactFilter('Veja https://example.com/item por favor');
    expect(result.outcome).toBe('ACCEPT');
    expect(result.maskedBody).toContain(LINK_REMOVED_TOKEN);
    expect(result.maskedBody).toContain('Veja');
  });
});

describe('when applyContactFilter receives only contact', () => {
  it('should REJECT email-only body', () => {
    const result = applyContactFilter('test@example.com');
    expect(result.outcome).toBe('REJECT');
  });

  it('should REJECT phone-only body', () => {
    const result = applyContactFilter('11987654321');
    expect(result.outcome).toBe('REJECT');
  });

  it('should REJECT URL-only body', () => {
    const result = applyContactFilter('https://example.com');
    expect(result.outcome).toBe('REJECT');
  });
});

describe('when applyContactFilter receives multiple contacts with useful text', () => {
  it('should ACCEPT and mask all contact patterns', () => {
    const result = applyContactFilter(
      'Email joao@example.com ou ligue 11987654321 ou veja https://example.com/item',
    );
    expect(result.outcome).toBe('ACCEPT');
    expect(result.maskedBody).toContain(CONTACT_REMOVED_TOKEN);
    expect(result.maskedBody).toContain(LINK_REMOVED_TOKEN);
    expect(result.maskedBody).not.toContain('joao@example.com');
    expect(result.maskedBody).not.toContain('11987654321');
    expect(result.maskedBody).not.toContain('https://example.com');
  });
});

describe('when applyContactFilter receives legitimate text with long numbers', () => {
  it('should ACCEPT without false positive masking on non-phone numeric text', () => {
    const result = applyContactFilter(
      'Placa RTX 4070 com 12 meses de garantia e nota fiscal inclusa',
    );
    expect(result.outcome).toBe('ACCEPT');
    expect(result.maskedBody).not.toContain(CONTACT_REMOVED_TOKEN);
    expect(result.maskedBody).not.toContain(LINK_REMOVED_TOKEN);
    expect(result.maskedBody).toContain('RTX 4070');
    expect(result.maskedBody).toContain('12 meses');
  });
});

describe('when applyContactFilter receives URL bypass patterns', () => {
  it('should ACCEPT and mask wa.me short links', () => {
    const result = applyContactFilter('Chama no wa.me/5511987654321 depois');
    expect(result.outcome).toBe('ACCEPT');
    expect(result.maskedBody).toContain(LINK_REMOVED_TOKEN);
    expect(result.maskedBody).not.toContain('wa.me/5511987654321');
  });

  it('should ACCEPT and mask t.me username without scheme', () => {
    const result = applyContactFilter('Grupo no t.me/vendedor_gamer ok?');
    expect(result.outcome).toBe('ACCEPT');
    expect(result.maskedBody).toContain(LINK_REMOVED_TOKEN);
    expect(result.maskedBody).not.toContain('t.me/vendedor_gamer');
  });

  it('should ACCEPT and mask bare domain with known TLD', () => {
    const result = applyContactFilter('Compre em loja.com/produto-x por favor');
    expect(result.outcome).toBe('ACCEPT');
    expect(result.maskedBody).toContain(LINK_REMOVED_TOKEN);
    expect(result.maskedBody).not.toContain('loja.com/produto-x');
  });

  it('should REJECT wa.me-only body', () => {
    const result = applyContactFilter('wa.me/5511987654321');
    expect(result.outcome).toBe('REJECT');
  });

  it('should REJECT t.me-only body without scheme', () => {
    const result = applyContactFilter('t.me/vendedor_gamer');
    expect(result.outcome).toBe('REJECT');
  });

  it('should REJECT bare domain-only body', () => {
    const result = applyContactFilter('loja.com/produto-x');
    expect(result.outcome).toBe('REJECT');
  });
});

describe('when applyContactFilter receives empty or whitespace', () => {
  it('should REJECT empty string', () => {
    const result = applyContactFilter('');
    expect(result.outcome).toBe('REJECT');
  });

  it('should REJECT whitespace-only string', () => {
    const result = applyContactFilter('   ');
    expect(result.outcome).toBe('REJECT');
  });
});
