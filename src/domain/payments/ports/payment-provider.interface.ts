export interface IParamsHoldEscrow {
  orderId: string;
  amountCents: number;
  currency: string;
}

export interface IPaymentProviderResult {
  success: boolean;
  providerReference?: string;
  failureReason?: string;
}

export interface IPaymentProvider {
  holdEscrow(params: IParamsHoldEscrow): Promise<IPaymentProviderResult>;
}
