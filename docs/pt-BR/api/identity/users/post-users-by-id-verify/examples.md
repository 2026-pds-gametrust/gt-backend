# Exemplos de uso — Verify a user identity

## Quando chamar no frontend

ADMIN/BACKOFFICE marca identidade verificada — nunca fingir selo na UI só com esse flag.

## Autorização

Bearer + group `backoffice` ou `admin` (`authorizeByGroup`).

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Não enviar body (apenas headers/params).
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/verify', {
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

Ver [curl.sh](./curl.sh).
