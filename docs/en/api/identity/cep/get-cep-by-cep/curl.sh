#!/usr/bin/env bash
# Lookup Brazilian postal code via BrasilAPI
curl -X GET 'http://localhost:3000/cep/01310100' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
