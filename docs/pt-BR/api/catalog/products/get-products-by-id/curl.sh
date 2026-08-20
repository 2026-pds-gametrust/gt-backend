#!/usr/bin/env bash
# Get product by id
curl -X GET 'http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000' \
  -H 'Accept: application/json'
