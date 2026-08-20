# Examples — Retrieve possession proof code plaintext for an open case

## When to call from the client

Possession code for seller capture / moderator frame check — never on public listing APIs.

## Authorization

Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Do not send a body (headers/params only).
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/verification-cases/550e8400-e29b-41d4-a716-446655440000/proof-code', {
  method: 'GET',
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
