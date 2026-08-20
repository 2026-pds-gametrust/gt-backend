#!/usr/bin/env bash
# List orders for the authenticated buyer or seller
curl -X GET 'http://localhost:3000/orders?page=1&pageSize=20&status=AWAITING_PAYMENT' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
