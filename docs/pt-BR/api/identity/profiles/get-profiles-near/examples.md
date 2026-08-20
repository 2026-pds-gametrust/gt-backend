# Exemplos de uso — Find profiles near a GeoJSON point

## Quando chamar no frontend

Listagem geo de perfis próximos — discovery, não é selo de confiança.

## Autorização

Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+).

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Não enviar body (apenas headers/params).
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

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

Ver [curl.sh](./curl.sh).
