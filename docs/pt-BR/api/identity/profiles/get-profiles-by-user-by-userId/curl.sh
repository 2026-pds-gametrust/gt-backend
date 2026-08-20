#!/usr/bin/env bash
# Get profile by user id
curl -X GET 'http://localhost:3000/profiles/by-user/550e8400-e29b-41d4-a716-446655440005' \
  -H 'Accept: application/json'
