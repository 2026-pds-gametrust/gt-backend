# Examples — Request granular listing changes (backoffice)

## When to call from the client

Request granular corrections (photo/video/description) — listing returns to DRAFT for seller edit.

## Authorization

Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Validate the payload against [request.md](./request.md) before submit.
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/verification-cases/550e8400-e29b-41d4-a716-446655440000/request-changes', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
  "summary": "string",
  "requiredChanges": [
    {
      "target": "PHOTO",
      "reason": "string",
      "assetId": "string",
      "checklistItemId": "string"
    }
  ]
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

See [curl.sh](./curl.sh).
