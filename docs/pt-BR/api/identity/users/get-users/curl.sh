#!/usr/bin/env bash
# Get all users
curl -X GET 'http://localhost:3000/users' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
