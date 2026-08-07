export interface IEventEnvelope<TPayload = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  schemaVersion: number;
  occurredAt: string;
  aggregateId: string;
  producerModule: string;
  correlationId: string;
  payload: TPayload;
}

export function createEventEnvelope<TPayload = Record<string, unknown>>(params: {
  eventId: string;
  eventType: string;
  aggregateId: string;
  producerModule: string;
  correlationId: string;
  payload: TPayload;
  schemaVersion?: number;
  occurredAt?: string;
}): IEventEnvelope<TPayload> {
  return {
    eventId: params.eventId,
    eventType: params.eventType,
    schemaVersion: params.schemaVersion ?? 1,
    occurredAt: params.occurredAt ?? new Date().toISOString(),
    aggregateId: params.aggregateId,
    producerModule: params.producerModule,
    correlationId: params.correlationId,
    payload: params.payload,
  };
}
