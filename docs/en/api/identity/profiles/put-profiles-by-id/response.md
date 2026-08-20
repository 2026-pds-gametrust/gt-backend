# Response — Update profile by id

**HTTP 200** — Profile updated

**OpenAPI schema:** `Profile`

| Field | Type | Required | Description |
|-------|------|-------------|----------|
| `id` | string | yes |  |
| `userId` | string | yes |  |
| `displayName` | string | no |  |
| `bio` | string | no |  |
| `locationApprox` | string | no |  |
| `addresses` | array<Address> | yes |  |
| `defaultShippingAddressId` | string | no |  |
| `setupItems` | array<object> | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |

**Example:**

```json
{
  "id": "string",
  "userId": "string",
  "displayName": "string",
  "bio": "string",
  "locationApprox": "string",
  "addresses": [
    {
      "id": "string",
      "label": "string",
      "recipientName": "string",
      "postalCode": "string",
      "street": "string",
      "number": "string",
      "complement": "string",
      "district": "string",
      "city": "string",
      "state": "string",
      "country": "BR",
      "isBilling": false,
      "isShipping": false,
      "geo": {
        "type": "Point",
        "coordinates": [
          0
        ]
      },
      "geoSource": "BRASIL_API"
    }
  ],
  "defaultShippingAddressId": "string",
  "setupItems": [
    {}
  ],
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Documented errors

- **400** — Bad request
- **401** — Missing, malformed, expired, invalid or logout-revoked Bearer token — AUTH_UNAUTHORIZED
- **403** — Actor is not the profile user and not backoffice/admin
- **404** — Profile not found
- **500** — Server error

### HTTP 400

Bad request

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

Actor is not the profile user and not backoffice/admin

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Authenticated user without permission — access-denied message, do not pretend the action succeeded.

### HTTP 404

Profile not found

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

