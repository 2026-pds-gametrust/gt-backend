# Examples — Find profiles near a GeoJSON point

## When to call from the client

Geo listing of nearby profiles — discovery, not a trust seal.

## Authorization

Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Do not send a body (headers/params only).
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/profiles/near', {
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
