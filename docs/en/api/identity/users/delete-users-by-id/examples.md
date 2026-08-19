# Examples — Delete a user

## When to call from the client

PII: GET/PUT/DELETE owner or ADMIN only. Owner PUT does not write verified/status.

## Authorization

Bearer + resource owner **or** `admin` (BACKOFFICE is not enough for User PII).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Do not send a body (headers/params only).
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

See [curl.sh](./curl.sh).
