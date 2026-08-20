import { ERequiredChangeTarget } from '../enums/ERequiredChangeTarget';

export interface IRequiredChange {
  target: ERequiredChangeTarget;
  reason: string;
  assetId?: string;
  checklistItemId?: string;
}

export interface IRevisionBaseline {
  assetIds: string[];
  videoAssetId?: string;
  description: string;
}

export interface IParamsRequiredChangeInput {
  target: ERequiredChangeTarget | string;
  reason: string;
  assetId?: string;
  checklistItemId?: string;
}
