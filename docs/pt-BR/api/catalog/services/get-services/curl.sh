#!/usr/bin/env bash
# List taxonomy services
curl -X GET 'http://localhost:3000/services' \
  -H 'Accept: application/json'
