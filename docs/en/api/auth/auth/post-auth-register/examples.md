# Examples — Register a marketplace member and issue a session

## When to call from the client

Public signup: creates User + credential, app-user group, returns tokens. Duplicate email/CPF → uniform 400 (not 409).

## Authorization

Public — no Authorization. Discovery and auth register/login/refresh (not CEP).

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Validate the payload against [request.md](./request.md) before submit.
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

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

See [curl.sh](./curl.sh).
