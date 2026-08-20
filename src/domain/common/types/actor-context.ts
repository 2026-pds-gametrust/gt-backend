export interface IActorContext {
  actorId: string;
  groups: string[];
  sessionId?: string;
  correlationId?: string;
}
