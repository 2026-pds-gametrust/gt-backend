# Exemplos de uso — Assign user groups (ADMIN only)

## Quando chamar no frontend

ADMIN atribui papéis (app-user, backoffice, admin). Sem auto-escalada nem SYSTEM.

## Autorização

Bearer + group `admin` apenas.

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Validar o payload contra [request.md](./request.md) antes do submit.
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/groups', {
  method: 'PUT',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
  "groups": [
    "app-user"
  ]
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

Ver [curl.sh](./curl.sh).
