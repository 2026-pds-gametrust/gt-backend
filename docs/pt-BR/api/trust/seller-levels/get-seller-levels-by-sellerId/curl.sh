#!/usr/bin/env bash
# Get seller level (default NEW)
curl -X GET 'http://localhost:3000/seller-levels/550e8400-e29b-41d4-a716-446655440004' \
  -H 'Accept: application/json'
