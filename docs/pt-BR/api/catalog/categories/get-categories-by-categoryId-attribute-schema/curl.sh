#!/usr/bin/env bash
# Get category attribute schema
curl -X GET 'http://localhost:3000/categories/550e8400-e29b-41d4-a716-446655440001/attribute-schema' \
  -H 'Accept: application/json'
