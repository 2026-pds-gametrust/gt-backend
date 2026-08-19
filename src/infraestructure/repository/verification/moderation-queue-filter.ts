import { FilterQuery } from 'mongoose';
import { escapeRegexLiteral } from '../../../domain/common/types/regex-literal';
import { IModerationQueueSearchScope } from '../../../domain/verification/entity/interfaces/moderation-queue.interface';
import { EVerificationCaseStatus } from '../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { IMVerificationCase } from '../../db/mongo/models/verification-case.model';

export function buildModerationQueueFilter(
  scope: IModerationQueueSearchScope,
  status?: EVerificationCaseStatus,
): FilterQuery<IMVerificationCase> {
  const and: FilterQuery<IMVerificationCase>[] = [];

  if (status) {
    and.push({ status });
  }

  if (scope.moderatorId?.trim()) {
    and.push({ moderatorId: scope.moderatorId.trim() });
  }

  if (scope.hasAiScore === false) {
    and.push({
      $or: [
        { 'checklist.aiAnalysis': { $exists: false } },
        { 'checklist.aiAnalysis.score': { $exists: false } },
      ],
    });
  } else if (scope.hasAiScore === true) {
    and.push({ 'checklist.aiAnalysis.score': { $exists: true, $type: 'number' } });
  }

  if (scope.minScore !== undefined || scope.maxScore !== undefined) {
    const scoreRange: Record<string, number> = {};
    if (scope.minScore !== undefined) {
      scoreRange.$gte = scope.minScore;
    }
    if (scope.maxScore !== undefined) {
      scoreRange.$lte = scope.maxScore;
    }
    and.push({ 'checklist.aiAnalysis.score': scoreRange });
  }

  const q = scope.q?.trim();
  if (q) {
    const escaped = escapeRegexLiteral(q);
    const or: FilterQuery<IMVerificationCase>[] = [
      { id: { $regex: escaped, $options: 'i' } },
      { listingId: { $regex: escaped, $options: 'i' } },
    ];
    if (scope.listingIds?.length) {
      or.push({ listingId: { $in: scope.listingIds } });
    }
    and.push({ $or: or });
  }

  if (and.length === 0) {
    return {};
  }

  return { $and: and };
}
