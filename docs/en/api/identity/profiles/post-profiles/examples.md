# Examples — Create a profile

## When to call from the client

Profile and addresses — seller presentation / delivery.

## Authorization

Bearer required (`Authorization: Bearer <accessToken>`). Any valid group (`app-user`+).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Validate the payload against [request.md](./request.md) before submit.
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/profiles', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
  "id": "string",
  "userId": "string",
  "displayName": "string",
  "bio": "string",
  "locationApprox": "string",
  "addresses": [
    {
      "id": "string",
      "label": "string",
      "recipientName": "string",
      "postalCode": "string",
      "street": "string",
      "number": "string",
      "complement": "string",
      "district": "string",
      "city": "string",
      "state": "string",
      "country": "BR",
      "isBilling": false,
      "isShipping": false,
      "geo": {
        "type": "Point",
        "coordinates": [
          0
        ]
      },
      "geoSource": "BRASIL_API"
    }
  ],
  "defaultShippingAddressId": "string",
  "setupItems": [
    {}
  ]
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

See [curl.sh](./curl.sh).
