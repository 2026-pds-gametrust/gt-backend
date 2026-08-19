#!/usr/bin/env bash
# List seals by listingId
curl -X GET 'http://localhost:3000/seals?listingId=string' \
  -H 'Accept: application/json'
