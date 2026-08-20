# Exemplos de uso — Update profile by id

## Quando chamar no frontend

Detalhe/update de perfil (mutação exige Bearer + ownership).

## Autorização

Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+).

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Validar o payload contra [request.md](./request.md) antes do submit.
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/profiles/550e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
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

Ver [curl.sh](./curl.sh).
