#!/usr/bin/env bash
# List trust events by sellerId
curl -X GET 'http://localhost:3000/trust-events?sellerId=string' \
  -H 'Accept: application/json'
