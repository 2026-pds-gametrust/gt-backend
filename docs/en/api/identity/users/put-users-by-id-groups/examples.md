# Examples — Assign user groups (ADMIN only)

## When to call from the client

ADMIN assigns roles (app-user, backoffice, admin). No self-escalation or SYSTEM.

## Authorization

Bearer + group `admin` only.

## Typical sequence

1. Build URL with path/query from [parameters.md](./parameters.md).
2. Validate the payload against [request.md](./request.md) before submit.
3. Handle success with [response.md](./response.md).
4. Map errors to toast/empty-state — **do not invent a trust state** on failure.

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

See [curl.sh](./curl.sh).
