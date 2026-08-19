# Examples — Add evidence metadata to a case

## When to call from the client

Evidence that supports the seal — auditability.

## Authorization

Public — no Authorization. Discovery and auth register/login/refresh (not CEP).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Validate the payload against [request.md](./request.md) before submit.
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/verification-cases/550e8400-e29b-41d4-a716-446655440003/evidence', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
  "id": "string",
  "type": "PHOTO",
  "storageKey": "string",
  "assetId": "string",
  "contentHash": "string"
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

See [curl.sh](./curl.sh).
