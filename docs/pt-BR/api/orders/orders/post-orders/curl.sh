#!/usr/bin/env bash
# Create a buy-now order for a published listing
curl -X POST 'http://localhost:3000/orders' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "string",
  "listingId": "string",
  "shippingMode": "PICKUP"
}'
