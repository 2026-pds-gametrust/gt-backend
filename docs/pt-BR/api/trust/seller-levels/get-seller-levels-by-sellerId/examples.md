# Exemplos de uso — Get seller level (default NEW)

## Quando chamar no frontend

Nível/badge de progressão — incentivo e sinal social.

## Autorização

Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer).

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Não enviar body (apenas headers/params).
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/seller-levels/550e8400-e29b-41d4-a716-446655440004', {
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

Ver [curl.sh](./curl.sh).
