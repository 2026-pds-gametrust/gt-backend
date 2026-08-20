#!/usr/bin/env bash
# List products
curl -X GET 'http://localhost:3000/products' \
  -H 'Accept: application/json'
