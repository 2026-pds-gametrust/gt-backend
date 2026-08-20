#!/usr/bin/env bash
# List verified public listings
curl -X GET 'http://localhost:3000/listings?sellerId=string&limit=20&offset=0' \
  -H 'Accept: application/json'
