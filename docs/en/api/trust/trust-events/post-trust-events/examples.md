# Examples — Append trust event (backoffice)

## When to call from the client

Ledger of events that feed the score (explainability).

## Authorization

Bearer + group `backoffice` or `admin` (`authorizeByGroup`).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Validate the payload against [request.md](./request.md) before submit.
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/trust-events', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
  "id": "string",
  "sellerId": "string",
  "type": "USER_VERIFIED",
  "sourceEventId": "string",
  "payload": {},
  "occurredAt": "2026-08-07T12:00:00.000Z"
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

See [curl.sh](./curl.sh).
