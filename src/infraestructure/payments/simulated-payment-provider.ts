import {
  IPaymentProvider,
  IParamsHoldEscrow,
  IPaymentProviderResult,
} from '../../domain/payments/ports/payment-provider.interface';

export class SimulatedPaymentProvider implements IPaymentProvider {
  async holdEscrow(params: IParamsHoldEscrow): Promise<IPaymentProviderResult> {
    if (process.env.GT_PAYMENT_SIMULATE_FAILURE === 'true') {
      return {
        success: false,
        failureReason: 'Simulated payment failure',
      };
    }
    return {
      success: true,
      providerReference: `sim-${params.orderId}`,
    };
  }
}
