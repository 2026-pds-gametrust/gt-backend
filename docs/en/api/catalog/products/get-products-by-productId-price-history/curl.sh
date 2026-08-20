#!/usr/bin/env bash
# List price history for a product
curl -X GET 'http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440002/price-history' \
  -H 'Accept: application/json'
