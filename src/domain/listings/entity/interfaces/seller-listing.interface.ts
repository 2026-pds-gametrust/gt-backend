import { EVerificationCaseStatus } from '../../../verification/entity/enums/EVerificationCaseStatus';
import { IRequiredChange } from '../../../verification/entity/interfaces/required-change.interface';
import { IListing } from './listing.interface';

export interface ISellerVerificationSummary {
  id: string;
  status: EVerificationCaseStatus;
  decisionReason?: string;
  requiredChanges?: IRequiredChange[];
  previousCaseId?: string;
  updatedAt?: Date;
}

export interface ISellerListing extends IListing {
  verificationCase?: ISellerVerificationSummary;
}

export interface ISellerListingPage {
  items: ISellerListing[];
  total: number;
  limit: number;
  offset: number;
}

export interface IListingPage {
  items: IListing[];
  total: number;
  limit: number;
  offset: number;
}

export const SELLER_LISTINGS_DEFAULT_LIMIT = 20;
export const SELLER_LISTINGS_MAX_LIMIT = 50;
