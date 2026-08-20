/**
 * Polling helpers. With EVENT_INPROCESS_DISPATCH=false every cross-context effect
 * travels through SNS -> SQS, so assertions must wait instead of reading straight
 * after the write.
 */
export async function waitFor<T>(
  description: string,
  probe: () => Promise<T | null>,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 45000;
  const intervalMs = options.intervalMs ?? 1500;
  const deadline = Date.now() + timeoutMs;
  let last: unknown = null;

  while (Date.now() < deadline) {
    const result = await probe();
    if (result !== null && result !== undefined) {
      return result;
    }
    last = result;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `timeout after ${timeoutMs}ms waiting for: ${description} (last=${JSON.stringify(last)})`,
  );
}
