# Examples — Get profile by id

## When to call from the client

Profile detail/update (mutation requires Bearer + ownership).

## Authorization

Public — no Authorization. Discovery and auth register/login/refresh (not CEP).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Do not send a body (headers/params only).
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/profiles/550e8400-e29b-41d4-a716-446655440000', {
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

See [curl.sh](./curl.sh).
