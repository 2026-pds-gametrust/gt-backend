# Exemplos de uso — Delete a favorite by id

## Quando chamar no frontend

Remove favorito.

## Autorização

Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+).

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Não enviar body (apenas headers/params).
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/favorites/550e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
});
if (!res.ok) throw await res.json();
// 204: sem JSON
```

## cURL

Ver [curl.sh](./curl.sh).
