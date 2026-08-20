# Exemplos de uso — Report a specific message

## Quando chamar no frontend

Suporta a experiência GamerTrust alinhada ao domínio.

## Autorização

Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+).

## Sequência típica

1. Montar URL com path/query de [parameters.md](./parameters.md).
2. Validar o payload contra [request.md](./request.md) antes do submit.
3. Tratar sucesso com [response.md](./response.md).
4. Mapear erros para toast/empty-state — **não inventar estado de confiança** em falha.

## Fetch (TypeScript)

```ts
const res = await fetch('http://localhost:3000/conversations/{conversationId}/messages/{messageId}/reports', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
  "reason": "string"
}),
});
if (!res.ok) throw await res.json();
const data = await res.json();
```

## cURL

Ver [curl.sh](./curl.sh).
