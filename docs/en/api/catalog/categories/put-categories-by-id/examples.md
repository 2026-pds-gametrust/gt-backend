# Examples — Update category

## When to call from the client

Canonical category detail for browse and forms.

## Authorization

Bearer + group `backoffice` or `admin` (`authorizeByGroup`).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Validate the payload against [request.md](./request.md) before submit.
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/categories/550e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
  "name": "string",
  "synonyms": [
    "string"
  ],
  "parentId": "string",
  "status": "ACTIVE"
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

See [curl.sh](./curl.sh).
