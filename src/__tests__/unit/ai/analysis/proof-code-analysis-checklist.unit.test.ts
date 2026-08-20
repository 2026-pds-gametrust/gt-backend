import {
  PROOF_CODE_ANALYSIS_CHECKLIST,
  PROOF_CODE_ANALYSIS_PROMPT_VERSION,
} from '../../../../domain/ai/analysis/proof-code-analysis-checklist';

describe('when proof-code analysis checklist is defined', () => {
  it('should expose presence, legibility and framing ids with canonical weights', () => {
    // TC-02
    expect(PROOF_CODE_ANALYSIS_PROMPT_VERSION).toBe('proof-code-v1');
    expect(PROOF_CODE_ANALYSIS_CHECKLIST.map((item) => item.id)).toEqual([
      'proof-code-present',
      'proof-code-legible',
      'proof-code-in-frame',
    ]);
    expect(PROOF_CODE_ANALYSIS_CHECKLIST.map((item) => item.weight)).toEqual([
      40, 35, 25,
    ]);
    for (const item of PROOF_CODE_ANALYSIS_CHECKLIST) {
      expect(item.promptHint.length).toBeGreaterThan(10);
    }
  });
});
