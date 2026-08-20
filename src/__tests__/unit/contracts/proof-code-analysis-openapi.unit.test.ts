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

describe('when inspecting proof-code analysis OpenAPI contract', () => {
  it('should document possession schemas distinct from public listing schemas', () => {
    // TC-29
    expect(yaml).toContain('ProofCodeAnalysisSnapshot:');
    expect(yaml).toContain('ProofCodeAnalysisChecklistItem:');
    expect(yaml).toContain('ProofCodeAnalysis:');
    expect(yaml).toContain('ReanalyzeProofCodeAnalysisResponse:');
    expect(yaml).toContain('checklist.proofCodeAnalysis');
    expect(yaml).toContain('checklist.aiAnalysis');

    expect(yaml).toContain('/verification-cases/{id}/proof-code-analysis:');
    expect(yaml).toContain(
      '/verification-cases/{id}/proof-code-analysis/reanalyze:',
    );
    expect(yaml).toMatch(
      /\/verification-cases\/\{id\}\/proof-code-analysis:[\s\S]*?'401':/,
    );
    expect(yaml).toMatch(
      /\/verification-cases\/\{id\}\/proof-code-analysis:[\s\S]*?'403':/,
    );
    expect(yaml).toMatch(
      /\/verification-cases\/\{id\}\/proof-code-analysis\/reanalyze:[\s\S]*?'401':/,
    );
    expect(yaml).toMatch(
      /\/verification-cases\/\{id\}\/proof-code-analysis\/reanalyze:[\s\S]*?'403':/,
    );

    const listing = schemaBlock('Listing');
    expect(listing).not.toContain('proofCodeAnalysis');
    expect(listing).not.toMatch(/proofCode[^I]|proofCodeHash|plaintext/);

    const sellerListing = schemaBlock('SellerListing');
    expect(sellerListing).not.toContain('proofCodeAnalysis');
  });
});
