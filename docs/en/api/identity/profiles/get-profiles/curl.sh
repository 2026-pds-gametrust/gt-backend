#!/usr/bin/env bash
# List profiles
curl -X GET 'http://localhost:3000/profiles' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
