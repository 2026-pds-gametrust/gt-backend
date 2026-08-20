# Examples — Upsert category attribute schema

## When to call from the client

Dynamic listing-form attributes per category — the client must not invent fields.

## Authorization

Bearer + group `backoffice` or `admin` (`authorizeByGroup`).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Validate the payload against [request.md](./request.md) before submit.
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/categories/550e8400-e29b-41d4-a716-446655440001/attribute-schema', {
  method: 'PUT',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
  "id": "string",
  "attributes": [
    {
      "key": "string",
      "name": "string",
      "valueType": "STRING",
      "required": false,
      "filterable": false,
      "facetOn": "PRODUCT",
      "enumValues": [
        "string"
      ],
      "unit": "string",
      "maxLength": 0,
      "allowVariations": false,
      "group": "string"
    }
  ]
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

See [curl.sh](./curl.sh).
