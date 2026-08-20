# Examples — Rebuild search_documents for PUBLISHED listings and synonym projections from taxonomy

## When to call from the client

Rebuild the search read model — operational consistency.

## Authorization

Bearer + group `backoffice` or `admin` (`authorizeByGroup`).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Do not send a body (headers/params only).
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/search/reconcile', {
  method: 'POST',
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
