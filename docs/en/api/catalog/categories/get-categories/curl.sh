#!/usr/bin/env bash
# List categories
curl -X GET 'http://localhost:3000/categories' \
  -H 'Accept: application/json'
