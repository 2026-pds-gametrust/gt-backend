# Exemplos de uso — Register a marketplace member and issue a session

## Quando chamar no frontend

Cadastro público: cria User + credencial, group app-user, devolve tokens. Duplicata de email/CPF → 400 uniforme (não 409).

## Autorização

Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer).

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Validar o payload contra [request.md](./request.md) antes do submit.
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "cpf": "string",
  "birthDate": "string",
  "password": "string"
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

Ver [curl.sh](./curl.sh).
