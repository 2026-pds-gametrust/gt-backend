# Exemplos de uso — Update product

## Quando chamar no frontend

Ficha do modelo para PDP de produto e deep-links.

## Autorização

Bearer + group `backoffice` ou `admin` (`authorizeByGroup`).

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Validar o payload contra [request.md](./request.md) antes do submit.
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
  "brand": "string",
  "model": "string",
  "series": "string",
  "mpn": "string",
  "ean": "string",
  "sku": "string",
  "specs": {},
  "imageUrls": [
    "string"
  ],
  "imageAssetIds": [
    "string"
  ],
  "referencePriceCents": 0,
  "currency": "string",
  "status": "ACTIVE"
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

Ver [curl.sh](./curl.sh).
