#!/usr/bin/env bash
# List synonym projections for expansion
curl -X GET 'http://localhost:3000/synonyms?q=string' \
  -H 'Accept: application/json'
