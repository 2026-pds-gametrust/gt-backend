import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { IThrowedError } from '@sauvvitech/st-packages';
import { IListing } from '../../listings/entity/interfaces/listing.interface';
import { ERequiredChangeTarget } from '../entity/enums/ERequiredChangeTarget';
import { EVerificationCaseStatus } from '../entity/enums/EVerificationCaseStatus';
import {
  IParamsRequiredChangeInput,
  IRequiredChange,
  IRevisionBaseline,
} from '../entity/interfaces/required-change.interface';
import { IVerificationCase } from '../entity/interfaces/verification-case.interface';

function normalizeTarget(value: string): ERequiredChangeTarget {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (normalized === ERequiredChangeTarget.PHOTO) {
    return ERequiredChangeTarget.PHOTO;
  }
  if (normalized === ERequiredChangeTarget.VIDEO) {
    return ERequiredChangeTarget.VIDEO;
  }
  if (normalized === ERequiredChangeTarget.DESCRIPTION) {
    return ERequiredChangeTarget.DESCRIPTION;
  }
  throw {
    status: 400,
    errorCode: EErrorCode.FIELD_INVALID,
    message: 'requiredChanges.target is invalid',
    details: { field: 'requiredChanges.target', value },
  } as IThrowedError;
}

export function buildRevisionBaseline(listing: IListing): IRevisionBaseline {
  return {
    assetIds: [...(listing.media.assetIds ?? [])],
    videoAssetId: listing.media.videoAssetId?.trim() || undefined,
    description: listing.description?.trim() ?? '',
  };
}

export function normalizeRequiredChanges(
  inputs: IParamsRequiredChangeInput[],
  listing: IListing,
): IRequiredChange[] {
  if (!Array.isArray(inputs) || inputs.length === 0) {
    throw {
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      message: 'requiredChanges must contain at least one item',
      details: { field: 'requiredChanges' },
    } as IThrowedError;
  }

  const seen = new Set<string>();
  const normalized: IRequiredChange[] = [];

  for (const input of inputs) {
    const target = normalizeTarget(String(input.target ?? ''));
    const reason = String(input.reason ?? '').trim();
    if (!reason) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'requiredChanges.reason is required',
        details: { field: 'requiredChanges.reason' },
      } as IThrowedError;
    }

    const assetId = input.assetId?.trim();
    if (target === ERequiredChangeTarget.PHOTO) {
      if (!assetId) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'assetId is required for PHOTO changes',
          details: { field: 'requiredChanges.assetId' },
        } as IThrowedError;
      }
      if (!(listing.media.assetIds ?? []).includes(assetId)) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'assetId does not belong to listing photos',
          details: { field: 'requiredChanges.assetId', assetId },
        } as IThrowedError;
      }
      const key = `PHOTO:${assetId}`;
      if (seen.has(key)) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'duplicate required change for photo asset',
          details: { field: 'requiredChanges', assetId },
        } as IThrowedError;
      }
      seen.add(key);
      normalized.push({
        target,
        reason,
        assetId,
        checklistItemId: input.checklistItemId?.trim() || undefined,
      });
      continue;
    }

    if (target === ERequiredChangeTarget.VIDEO) {
      const listingVideoId = listing.media.videoAssetId?.trim();
      if (!listingVideoId) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'listing has no video to request changes for',
          details: { field: 'requiredChanges.target' },
        } as IThrowedError;
      }
      const resolvedAssetId = assetId ?? listingVideoId;
      if (resolvedAssetId !== listingVideoId) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'assetId does not match listing video',
          details: { field: 'requiredChanges.assetId', assetId: resolvedAssetId },
        } as IThrowedError;
      }
      const key = `VIDEO:${resolvedAssetId}`;
      if (seen.has(key)) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'duplicate required change for video',
          details: { field: 'requiredChanges' },
        } as IThrowedError;
      }
      seen.add(key);
      normalized.push({
        target,
        reason,
        assetId: resolvedAssetId,
        checklistItemId: input.checklistItemId?.trim() || undefined,
      });
      continue;
    }

    if (seen.has('DESCRIPTION')) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'duplicate required change for description',
        details: { field: 'requiredChanges' },
      } as IThrowedError;
    }
    seen.add('DESCRIPTION');
    normalized.push({
      target,
      reason,
      checklistItemId: input.checklistItemId?.trim() || undefined,
    });
  }

  return normalized;
}

export function assertRequiredChangesApplied(
  listing: IListing,
  verificationCase: IVerificationCase,
): void {
  const requiredChanges = verificationCase.requiredChanges ?? [];
  const baseline = verificationCase.revisionBaseline;
  if (requiredChanges.length === 0 || !baseline) {
    return;
  }

  const currentAssetIds = new Set(listing.media.assetIds ?? []);
  const currentDescription = listing.description?.trim() ?? '';
  const currentVideoId = listing.media.videoAssetId?.trim();

  for (const change of requiredChanges) {
    if (change.target === ERequiredChangeTarget.PHOTO && change.assetId) {
      if (currentAssetIds.has(change.assetId)) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'Replace or remove the requested photo before resubmitting',
          details: { field: 'media.assetIds', assetId: change.assetId },
        } as IThrowedError;
      }
      continue;
    }

    if (change.target === ERequiredChangeTarget.VIDEO) {
      const baselineVideo = baseline.videoAssetId?.trim();
      if (baselineVideo && currentVideoId === baselineVideo) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'Replace the requested video before resubmitting',
          details: { field: 'media.videoAssetId' },
        } as IThrowedError;
      }
      continue;
    }

    if (change.target === ERequiredChangeTarget.DESCRIPTION) {
      if (currentDescription === baseline.description) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'Update the description before resubmitting',
          details: { field: 'description' },
        } as IThrowedError;
      }
    }
  }
}

export function findLatestChangesRequestedCase(
  cases: IVerificationCase[],
): IVerificationCase | null {
  for (const verificationCase of cases) {
    if (verificationCase.status === EVerificationCaseStatus.CHANGES_REQUESTED) {
      return verificationCase;
    }
  }
  return null;
}
