# Response — List verified public listings

**HTTP 200** — Verified listing page or seller-filtered list

```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/ListingPage"
    },
    {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/Listing"
      }
    }
  ]
}
```

## Documented errors

- **400** — Invalid pagination
- **500** — Server error

### HTTP 400

Invalid pagination

**Example:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Validation / `USER_UNDERAGE` / `FIELD_INVALID` (duplicate register is also 400). Highlight fields; **do not** treat register 400 as “email already exists” in copy.

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

