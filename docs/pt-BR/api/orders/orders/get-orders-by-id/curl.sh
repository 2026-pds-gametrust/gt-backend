#!/usr/bin/env bash
# Get order by id (buyer or seller only)
curl -X GET 'http://localhost:3000/orders/550e8400-e29b-41d4-a716-446655440000' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
