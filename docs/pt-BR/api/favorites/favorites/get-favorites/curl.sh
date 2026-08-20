#!/usr/bin/env bash
# List favorites for the authenticated actor
curl -X GET 'http://localhost:3000/favorites?userId=string' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
