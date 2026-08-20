import { computeAnalysisScore } from '../../../../domain/ai/analysis/listing-analysis-checklist';
import { EAnalysisChecklistItemStatus } from '../../../../domain/ai/entity/enums/EAnalysisChecklistItemStatus';

describe('when computing analysis score', () => {
  it('should return weighted pass ratio excluding uncertain items', () => {
    const score = computeAnalysisScore([
      { status: EAnalysisChecklistItemStatus.PASS, weight: 15 },
      { status: EAnalysisChecklistItemStatus.FAIL, weight: 10 },
      { status: EAnalysisChecklistItemStatus.UNCERTAIN, weight: 25 },
      { status: EAnalysisChecklistItemStatus.PASS, weight: 15 },
    ]);

    expect(score).toBe(75);
  });

  it('should return 0 when no applicable items exist', () => {
    const score = computeAnalysisScore([
      { status: EAnalysisChecklistItemStatus.UNCERTAIN, weight: 10 },
    ]);

    expect(score).toBe(0);
  });

  it('should return 100 when all applicable items pass', () => {
    const score = computeAnalysisScore([
      { status: EAnalysisChecklistItemStatus.PASS, weight: 10 },
      { status: EAnalysisChecklistItemStatus.PASS, weight: 20 },
    ]);

    expect(score).toBe(100);
  });
});
