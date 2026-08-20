# Response — Lookup Brazilian postal code via BrasilAPI

**HTTP 200** — CEP found

**OpenAPI schema:** `CepLookupResult`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `postalCode` | string | yes |  |
| `street` | string | no |  |
| `district` | string | no |  |
| `city` | string | yes |  |
| `state` | string | yes |  |
| `geo` | GeoPoint | no |  |

**Example:**

```json
{
  "postalCode": "string",
  "street": "string",
  "district": "string",
  "city": "string",
  "state": "string",
  "geo": {
    "type": "Point",
    "coordinates": [
      0
    ]
  }
}
```

## Documented errors

- **400** — Invalid CEP
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Caller is not in an allowed user group
- **404** — CEP not found
- **500** — Server error
- **502** — Maps/CEP upstream failure

### HTTP 400

Invalid CEP

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Validation / `USER_UNDERAGE` / `FIELD_INVALID` (duplicate register is also 400). Highlight fields; **do not** treat register 400 as “email already exists” in copy.

### HTTP 401

Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Clear the session if access expired; try `POST /auth/refresh`; if that fails, go to login. **Do not** spoof `x-user-id`.

### HTTP 403

Caller is not in an allowed user group

**Example:**

```json
{
  "error": "Access denied"
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

### HTTP 404

CEP not found

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / page 404. Do not invent the resource.

### HTTP 500

Server error

**Example:**

```json
{
  "message": "User not found",
  "status": 404,
  "timestamp": "2025-07-15T17:30:00.000Z",
  "path": "/users/123"
}
```

Generic error; do not leak internals.

### HTTP 502

Maps/CEP upstream failure

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Generic error; do not leak internals.

